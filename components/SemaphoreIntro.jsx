import React from 'react';

export default function SemaphoreIntro() {
  return (
    <div className='border-2 '>
      <h2 className='text-5xl flex justify-center  mb-2 mt-4'>
        How does ZkVote work?
      </h2>
      <div className='border-dashed border-black  box-content h-30 w-70 p-2 border-4 '>
        <p className='italic '>
          Semaphore is a zero-knowledge protocol that allows users to prove
          their membership in a group and send signals such as votes or
          endorsements without revealing their identity. Additionally, it
          provides a simple mechanism to prevent double-signaling.
        </p>
        <ul>
          <li className='mb-2'>Create or load an identity!</li>
          <li className='mb-2'>
            Create a new Vote Proposal or voting on an existing Proposal.
          </li>
        </ul>
      </div>
    </div>
  );
}
