// Disk Scheduling Algorithms

// FCFS (First Come First Serve)
export const fcfsAlgorithm = (requests, startPosition) => {
  const path = requests.map(Number);
  let seekCount = 0;
  let currentPosition = startPosition;

  for (let i = 0; i < path.length; i++) {
    seekCount += Math.abs(currentPosition - path[i]);
    currentPosition = path[i];
  }

  return { path, seekCount };
};

// SSTF (Shortest Seek Time First)
export const sstfAlgorithm = (requests, startPosition) => {
  const remainingRequests = [...requests.map(Number)];
  const path = [];
  let seekCount = 0;
  let currentPosition = startPosition;

  while (remainingRequests.length > 0) {
    let shortestSeek = Infinity;
    let nextIndex = 0;

    for (let i = 0; i < remainingRequests.length; i++) {
      const seekDistance = Math.abs(currentPosition - remainingRequests[i]);
      if (seekDistance < shortestSeek) {
        shortestSeek = seekDistance;
        nextIndex = i;
      }
    }

    const nextTrack = remainingRequests[nextIndex];
    path.push(nextTrack);
    seekCount += shortestSeek;
    currentPosition = nextTrack;
    remainingRequests.splice(nextIndex, 1);
  }

  return { path, seekCount };
};

// SCAN (Elevator Algorithm)
export const scanAlgorithm = (requests, startPosition, direction = 'up', maxTrack = 199) => {
  const tracks = [...requests.map(Number)];
  const path = [];
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  if (direction === 'up') {
    // Move upward
    for (let track of tracks) {
      if (track >= currentPosition) {
        path.push(track);
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
      }
    }
    // Then move downward for remaining tracks
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] < startPosition) {
        path.push(tracks[i]);
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
      }
    }
  } else {
    // Move downward
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] <= currentPosition) {
        path.push(tracks[i]);
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
      }
    }
    // Then move upward for remaining tracks
    for (let track of tracks) {
      if (track > startPosition) {
        path.push(track);
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
      }
    }
  }

  return { path, seekCount };
};

// C-SCAN (Circular SCAN)
export const cscanAlgorithm = (requests, startPosition, maxTrack = 199) => {
  const tracks = [...requests.map(Number)];
  const path = [];
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  // First serve all tracks greater than startPosition
  for (let track of tracks) {
    if (track >= startPosition) {
      path.push(track);
      seekCount += Math.abs(currentPosition - track);
      currentPosition = track;
    }
  }

  // Then move to the beginning and serve remaining tracks
  if (tracks.some(track => track < startPosition)) {
    seekCount += Math.abs(currentPosition - maxTrack) + maxTrack; // Move to end and then to start
    currentPosition = 0;
    
    for (let track of tracks) {
      if (track < startPosition) {
        path.push(track);
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
      }
    }
  }

  return { path, seekCount };
};

// LOOK
export const lookAlgorithm = (requests, startPosition, direction = 'up') => {
  const tracks = [...requests.map(Number)];
  const path = [];
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  if (direction === 'up') {
    // Move upward
    for (let track of tracks) {
      if (track >= currentPosition) {
        path.push(track);
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
      }
    }
    // Then move downward
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] < startPosition) {
        path.push(tracks[i]);
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
      }
    }
  } else {
    // Move downward
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] <= currentPosition) {
        path.push(tracks[i]);
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
      }
    }
    // Then move upward
    for (let track of tracks) {
      if (track > startPosition) {
        path.push(track);
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
      }
    }
  }

  return { path, seekCount };
};

// C-LOOK
export const clookAlgorithm = (requests, startPosition) => {
  const tracks = [...requests.map(Number)];
  const path = [];
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  // First serve all tracks greater than startPosition
  for (let track of tracks) {
    if (track >= startPosition) {
      path.push(track);
      seekCount += Math.abs(currentPosition - track);
      currentPosition = track;
    }
  }

  // Then directly move to the lowest track and continue upward
  if (tracks.some(track => track < startPosition)) {
    const lowestTrack = Math.min(...tracks.filter(track => track < startPosition));
    seekCount += Math.abs(currentPosition - lowestTrack);
    currentPosition = lowestTrack;
    
    for (let track of tracks) {
      if (track < startPosition) {
        path.push(track);
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
      }
    }
  }

  return { path, seekCount };
}; 