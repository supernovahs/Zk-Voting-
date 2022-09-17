pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

// Importing Sempahore core contract and semaphore verifier contract.
import "./semaphorecore.sol";
import "./semaphoregroups.sol";
import "./IVerifier.sol";

/** @author: Supernovahs.eth <supernovahs@proton.me> */
/**  dev: ZK Voting Protocol powered by Sempahore Proofs for anonymous signalling. */
contract ZkVote is SemaphoreCore,SemaphoreGroups{
  /*********************** Storage **********************/
    mapping(uint => IVerifier) public  verifiers;  
    mapping(uint =>mapping(bytes32 => uint)) public VotesperProposal;
    mapping(uint256 => Poll) public polls;

   /********************Events**********************************/

    event NewProposal(uint indexed id,bytes32 indexed eventname,address coordinator,string description);
    event CastedVote(uint indexed groupId,bytes32 vote);
    event VoteStarts(uint indexed groupId,uint64 starttime,uint64 endtime);

    enum PollState{
      Created
    }

 /*******************************Structs *********************************/
 
    struct Results{
      bytes32  proposals;
      uint  votes;
    }

    struct ResultsandAddresses{
      bytes32 proposals;
      uint votes;
      address IndividualGrantee;
    }

    struct Poll{
      address coordinator;
      PollState pollstate;
      uint64 endtime;
      bytes32 pollname;
      string description;
      bytes32[] proposals;
      address[] grantees;
      uint fund;
    }

/***************************CUSTOM ERRORS *****************************/
    
  error ALREADY_STARTED();
  error NOT_ADMIN();
  error NOT_SAME_LENGTH();
  error VOTING_ENDED();
  error INVALID_TIMESTAMP();
  error NOT_ENOUGH_VOTES();
  error INVALID();
  error VOTING_NOT_ENDED();
  error VALUE_NOT_SENT();

/// @dev Checks  if msg.sender == admin 
    modifier onlyAdmin(uint _pollId){
      if(msg.sender != polls[_pollId].coordinator){
        revert NOT_ADMIN();
      }
      _;
    }

///  @dev Payable to save gas on deployment
  constructor(uint[] memory _depths,address[] memory _verifieraddresses) payable {
  if(_depths.length != _verifieraddresses.length){
  revert NOT_SAME_LENGTH();
  }

  uint depthlength = _depths.length;
  uint i;
    for (; i < depthlength;) {
            verifiers[_depths[i]] = IVerifier(_verifieraddresses[i]);
            unchecked{
              ++i;
            }
    }
  }

  function getproposals(uint _id) public view returns(bytes32[] memory ){
    return polls[_id].proposals;
  }
  function NewVoteInstance(bytes32 _eventName,string memory _description,bytes32[] memory  _proposals,address[] calldata _grantees,address  _coordinator,uint8 _depth,uint _zerovalue) public payable  {
    uint _pollId= hashEventName(_eventName);
    _createGroup(_pollId,_depth,_zerovalue);
    Poll memory poll;
    poll.coordinator = _coordinator;
    poll.pollstate = PollState.Created;
    poll.pollname = _eventName;
    poll.description = _description;
    poll.proposals = _proposals;
    bool addressInput = _grantees.length> 0 && _grantees.length == _proposals.length;

    if(addressInput){
      poll.grantees = _grantees;
      poll.fund = msg.value;
    }
      polls[_pollId]= poll;
    emit NewProposal(_pollId,_eventName,_coordinator,_description);
  }

   function hashEventName(bytes32 eventId) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(eventId))) >> 8;
  }

  function Addvoter(uint _pollId,uint _identitycommitment) external  onlyAdmin(_pollId) {
    if(polls[_pollId].pollstate != PollState.Created){
      revert ALREADY_STARTED();
    }
    _addMember(_pollId,_identitycommitment);

  }   
/// Get latest votes in case proposals does not include grantees addresses 
/// @param _pollId Poll Id of the group 
/// @dev No need for gas optimization as function is view.
/// Returns Results Struct

  function getlatestVotes(uint _pollId) public view returns(Results[] memory ){
    
    uint lengthofproposal =  polls[_pollId].proposals.length;
  if(polls[_pollId].grantees.length ==0)
  {
    Results[] memory results = new Results[](lengthofproposal);

    for(uint i=0 ;i<lengthofproposal;++i){
      bytes32  signal = polls[_pollId].proposals[i];
      results[i] = Results({
        proposals: signal,
        votes:VotesperProposal[_pollId][signal]
      });
    }
    return results;
}
 
  }

  /// Get Votes in case Proposal includes grantees 
  /// @param _pollId PollId of the Instance 
  /// Returns ResultsandAddresses struct

  function getLatestVotesWithGrantees(uint _pollId) public view returns (ResultsandAddresses[] memory){
        uint lengthofproposal =  polls[_pollId].proposals.length;

    ResultsandAddresses[] memory results = new ResultsandAddresses[](lengthofproposal);

for(uint i=0 ;i<lengthofproposal;++i){
      bytes32  signal = polls[_pollId].proposals[i];
      address _grantee = polls[_pollId].grantees[i];
      results[i] = ResultsandAddresses({
        proposals: signal,
        votes:VotesperProposal[_pollId][signal],
        IndividualGrantee:_grantee
      });
    }
    
  return results;
  }

/// @param _pollId  pollId of the Group
/// @param _identityCommitment Identity details of the member
/// @param _proofSiblings Merkle proof siblings
/// @param _proofPathIndices merkle proof path indices
/// Function to remove a Member from a  pollId
  function RemoveVoter(uint256 _pollId,
        uint256 _identityCommitment,
        uint256[] calldata _proofSiblings,
        uint8[] calldata _proofPathIndices) external onlyAdmin(_pollId) {
          if(polls[_pollId].pollstate != PollState.Created){
      revert ALREADY_STARTED();
    }
  _removeMember(_pollId,_identityCommitment,_proofSiblings,_proofPathIndices);
  }

/// Starts a poll 
/// @param _pollId Id of the poll for which to start Voting for .
/// @param _endtime Timestamp when voting ends. 
  function StartPoll(uint _pollId,uint64 _endtime) external { 
    Poll storage poll= polls[_pollId];
     if(polls[_pollId].pollstate != PollState.Created){
      revert ALREADY_STARTED();
  }
  if(_endtime < block.timestamp){
    revert INVALID_TIMESTAMP();
  }
      poll.endtime = _endtime;

  emit VoteStarts(_pollId,uint64(block.timestamp),_endtime);
  }


  /// Disperse Funds to the grantees in ratio of vote
  /// @param _pollId PollId of the group 
  function disperse(uint _pollId) external {
    uint i ;
  uint length = polls[_pollId].grantees.length;
  if(block.timestamp <polls[_pollId].endtime){
    revert VOTING_NOT_ENDED();
  }
  
  uint[] memory votes = new uint[](length);
   ResultsandAddresses[] memory result = getLatestVotesWithGrantees(_pollId);
   uint totalvotes;
  for(;;){
    i<length;
    votes[i] = result[i].votes;
    totalvotes+= result[i].votes;
    unchecked{
      ++i;
    }
  }
  uint z ;
  for(;;){
    z < length;
    (bool s , bytes memory r ) = result[z].IndividualGrantee.call{value:votes[z]/ totalvotes}("");
    if(!s){
      revert VALUE_NOT_SENT();
    }
    unchecked{
      ++i;
    }
  }

    
  }


/// Cast Vote for a particular Id
/// @param _vote Array of signals for which to vote in order
/// @param position  Quadratic weightage to give to each signal mentioned in _vote array
/// @param _nullifierHash Unique identifier to prevent Double Signalling
/// @param _pollId Id of the Poll 
/// @param _proof Zk Proofs generated in uint[8] format 
  function castVote(
        bytes32[] calldata _vote,
        uint[] calldata position,
        uint256 _nullifierHash,
        uint256 _pollId,
        uint256[8] calldata _proof) external  {

          if(polls[_pollId].endtime < block.timestamp){
            revert VOTING_ENDED();
          }
          if(_vote.length != position.length){
            revert NOT_SAME_LENGTH();
          }
          
        uint depth = getDepth(_pollId);
        uint256 root = getRoot(_pollId);
        IVerifier verifier = verifiers[depth]; 
        _verifyProof(_vote[0], root, _nullifierHash,_pollId, _proof, verifier);
        _saveNullifierHash(_nullifierHash);
        uint totalvotes;
        uint length = position.length;
        uint i;
        for(; ;){
          if(i >=length){
            revert INVALID();
          }
          VotesperProposal[_pollId][_vote[i]] += (position[i]) * (position[i]);   
          totalvotes += position[i] * position[i];
          unchecked{
            ++i;
          }
        }

        if(totalvotes >100){
          revert NOT_ENOUGH_VOTES();
        }
        }

}