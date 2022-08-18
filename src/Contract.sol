pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

// Importing Sempahore core contract and semaphore verifier contract.
import "./semaphorecore.sol";
import "./semaphoregroups.sol";
import "./IVerifier.sol";
contract ZkVote is SemaphoreCore,SemaphoreGroups{
    mapping(uint => IVerifier) public  verifiers;
    
    mapping(uint =>mapping(bytes32 => uint)) public VotesperProposal;


    event NewProposal(uint indexed id,address indexed coordinator);
    event CastedVote(uint indexed groupId,bytes32 vote);
    event VoteStarts(uint indexed groupId,uint time);
    event VoteEnds(uint indexed groupId,uint time);

    enum PollState{
      Created,
      Ongoing,
      Ended
    }

    struct Results{
      bytes32  proposals;
      uint  votes;
    }

    struct Poll{
      address coordinator;
      PollState pollstate;
      bytes32 pollname;
      string description;
      bytes32[] proposals;
    }

  mapping(uint256 => Poll) public polls;
    
  error VotingAlreadyStarted();
  error NotAdmin();
  error NotSamelength();

    modifier onlyAdmin(uint _pollId){
      if(msg.sender != polls[_pollId].coordinator){
        revert NotAdmin();
      }
      _;
    }

  constructor(uint[] memory _depths,address[] memory _verifieraddresses) payable {
  if(_depths.length != _verifieraddresses.length){
  revert NotSamelength();

  }

  uint depthlength = _depths.length;
    for (uint i=0; i < depthlength;i++) {
            verifiers[_depths[i]] = IVerifier(_verifieraddresses[i]);
    }
  }

  function NewVoteInstance(bytes32 _eventName,string memory _description,bytes32[] memory  _proposals,address  _coordinator,uint8 _depth,uint _zerovalue) public   {
    uint _pollId= hashEventName(_eventName);
    _createGroup(_pollId,_depth,_zerovalue);
    Poll memory poll;
    poll.coordinator = _coordinator;
    poll.pollstate = PollState.Created;
    poll.pollname = _eventName;
    poll.description = _description;
    poll.proposals = _proposals;
    polls[_pollId]= poll;

    emit NewProposal(_pollId,_eventName);

  }

   function hashEventName(bytes32 eventId) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(eventId))) >> 8;
  }

  function Addvoter(uint _pollId,uint _identitycommitment) external  onlyAdmin(_pollId) {
    // if(polls[_pollId].pollstate != PollState.Created){
    //   revert VotingAlreadyStarted();
    // }
    _addMember(_pollId,_identitycommitment);

  }   

  function getlatestVotes(uint _pollId) public view returns(Results[] memory ){
    
    uint lengthofproposal =  polls[_pollId].proposals.length;

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

  function RemoveVoter(uint256 _pollId,
        uint256 _identityCommitment,
        uint256[] calldata _proofSiblings,
        uint8[] calldata _proofPathIndices) external onlyAdmin(_pollId) {
          if(polls[_pollId].pollstate != PollState.Created){
      revert VotingAlreadyStarted();
    }
  _removeMember(_pollId,_identityCommitment,_proofSiblings,_proofPathIndices);
  }


  function StartPoll(uint _pollId) external { 
    Poll storage poll= polls[_pollId];
     if(polls[_pollId].pollstate != PollState.Created){
      revert VotingAlreadyStarted();

  }
      poll.pollstate = PollState.Ongoing;

  emit VoteStarts(_pollId,block.timestamp);
  }

  function castVote(bytes32  _vote,
        uint256 _nullifierHash,
        uint256 _pollId,
        uint _externalNullifier,
        uint256[8] calldata _proof) external  {

          if(polls[_pollId].pollstate != PollState.Ongoing){
            revert VotingAlreadyStarted();
          }

        uint depth = getDepth(_pollId);
        uint256 root = groups[_pollId].root;
        IVerifier verifier = verifiers[depth]; 
        _verifyProof(_vote, root, _nullifierHash,root, _proof, verifier);
        _saveNullifierHash(_nullifierHash);
        VotesperProposal[_pollId][_vote] ++;
        }

function endPoll(uint _pollId) external onlyAdmin(_pollId){
  if(polls[_pollId].pollstate != PollState.Ongoing){
    revert VotingAlreadyStarted();
  }
  polls[_pollId].pollstate = PollState.Ended;

  emit VoteEnds(_pollId,block.timestamp);
}
}