/**
 * BharatChat - WebRTC Real-Time Audio & Video Call Signaling Service
 * Powered by Firebase Firestore and WebRTC RTCPeerConnection
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  getDocs,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { CallSession, CallStatus, UserProfile } from '../types';

// Standard Google STUN servers for WebRTC NAT traversal
export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

// ==========================================
// 1. Web Audio Tone Generator (Ringtone, Dialtone, End tone)
// ==========================================
class WebAudioTones {
  private ctx: AudioContext | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play outgoing ringing dialtone (dual frequencies: 440Hz + 480Hz pulses)
  public playDialtone() {
    this.stop();
    try {
      const ctx = this.getAudioContext();
      const playBeep = () => {
        if (!this.ctx || this.ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      };

      playBeep();
      this.intervalId = setInterval(playBeep, 2500);
    } catch (err) {
      console.warn('Audio tone play error:', err);
    }
  }

  // Play incoming Bharat melodic ringtone (crystal chime pattern)
  public playRingtone() {
    this.stop();
    try {
      const ctx = this.getAudioContext();
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio notes

      const playMelody = () => {
        if (!this.ctx || this.ctx.state === 'closed') return;
        const now = ctx.currentTime;
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.18);

          gain.gain.setValueAtTime(0.12, now + idx * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 0.4);
        });
      };

      playMelody();
      this.intervalId = setInterval(playMelody, 2000);
    } catch (err) {
      console.warn('Ringtone error:', err);
    }
  }

  // Play disconnect double beep
  public playEndCallTone() {
    this.stop();
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      [0, 0.2].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(480, now + offset);
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch {}
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
  }
}

export const callAudioTones = new WebAudioTones();

// ==========================================
// 2. Media Stream Helpers (Microphone & Camera)
// ==========================================
export async function getLocalUserMedia(
  type: 'voice' | 'video',
  facingMode: 'user' | 'environment' = 'user'
): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video:
        type === 'video'
          ? {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            }
          : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error: any) {
    console.warn('getUserMedia warning/fallback:', error);

    // If video requested but failed (e.g. no camera), fallback to audio-only or canvas stream
    if (type === 'video') {
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Create dummy video track from canvas
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 640, 480);
          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('BharatChat HD Video Feed', 160, 240);
        }
        const canvasStream = canvas.captureStream(15);
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (videoTrack) audioOnlyStream.addTrack(videoTrack);
        return audioOnlyStream;
      } catch (fallbackErr) {
        console.warn('Audio fallback also failed:', fallbackErr);
      }
    }

    // Synthetic silent audio stream as final safe fallback to allow WebRTC connection
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const dst = audioCtx.createMediaStreamDestination();
    osc.connect(dst);
    osc.start();
    return dst.stream;
  }
}

// Flip camera by replacing video track on active RTCRtpSender
export async function switchVideoCamera(
  peerConnection: RTCPeerConnection | null,
  currentStream: MediaStream,
  newFacingMode: 'user' | 'environment'
): Promise<{ newStream: MediaStream; newTrack: MediaStreamTrack | null }> {
  try {
    const newMedia = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: newFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    const newVideoTrack = newMedia.getVideoTracks()[0];
    if (!newVideoTrack) return { newStream: currentStream, newTrack: null };

    // Stop old video track
    currentStream.getVideoTracks().forEach((t) => t.stop());
    currentStream.removeTrack(currentStream.getVideoTracks()[0]);
    currentStream.addTrack(newVideoTrack);

    // Replace on peer connection sender
    if (peerConnection) {
      const senders = peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(newVideoTrack);
      }
    }

    return { newStream: currentStream, newTrack: newVideoTrack };
  } catch (err) {
    console.error('Failed to switch camera:', err);
    return { newStream: currentStream, newTrack: null };
  }
}

// ==========================================
// 3. Audio Frequency Analyser (Voice Waveform)
// ==========================================
export function createAudioAnalyser(stream: MediaStream) {
  try {
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) return null;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    return {
      getFrequencies: (barsCount = 15): number[] => {
        analyser.getByteFrequencyData(dataArray);
        const result: number[] = [];
        const step = Math.floor(dataArray.length / barsCount) || 1;
        for (let i = 0; i < barsCount; i++) {
          const val = dataArray[i * step] || 0;
          // Scale from 0-255 to percentage 15-100
          const pct = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
          result.push(pct);
        }
        return result;
      },
      close: () => {
        try {
          source.disconnect();
          analyser.disconnect();
          audioCtx.close();
        } catch {}
      },
    };
  } catch (err) {
    console.warn('Audio analyser error:', err);
    return null;
  }
}

// ==========================================
// 4. Firestore WebRTC Call Signaling Methods
// ==========================================

export interface InitiateCallParams {
  caller: UserProfile;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'voice' | 'video';
}

/**
 * Initiates an outgoing 1-on-1 call session with SDP Offer and ICE gathering
 */
export async function initiateCallSession(
  params: InitiateCallParams,
  localStream: MediaStream,
  onRemoteStream: (stream: MediaStream) => void,
  onStatusChange: (status: CallStatus) => void
): Promise<{ callId: string; peerConnection: RTCPeerConnection }> {
  const callDocRef = doc(collection(db, 'calls'));
  const callId = callDocRef.id;

  const peerConnection = new RTCPeerConnection(RTC_CONFIG);
  const remoteStream = new MediaStream();

  // Add local stream tracks to WebRTC peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Handle incoming remote tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
    onRemoteStream(remoteStream);
  };

  // Listen to connection state changes
  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;
    if (state === 'connected') {
      onStatusChange('connected');
      callAudioTones.stop();
    } else if (state === 'disconnected' || state === 'failed') {
      onStatusChange('reconnecting');
    } else if (state === 'closed') {
      onStatusChange('ended');
      callAudioTones.stop();
    }
  };

  // Subcollections for ICE candidates
  const callerCandidatesCol = collection(db, 'calls', callId, 'callerCandidates');
  const calleeCandidatesCol = collection(db, 'calls', callId, 'calleeCandidates');

  // Push local ICE candidates to Firestore
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      try {
        await addDoc(callerCandidatesCol, {
          candidate: event.candidate.toJSON(),
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('Error adding caller ICE candidate:', err);
      }
    }
  };

  // Create WebRTC Offer
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: params.type === 'video',
  });
  await peerConnection.setLocalDescription(offer);

  const callData: CallSession = {
    id: callId,
    callerId: params.caller.id,
    callerName: params.caller.name,
    callerAvatar: params.caller.avatar,
    receiverId: params.receiverId,
    receiverName: params.receiverName,
    receiverAvatar: params.receiverAvatar,
    type: params.type,
    status: 'offering',
    offer: {
      type: offer.type,
      sdp: offer.sdp || '',
    },
    answer: null,
    createdAt: Date.now(),
    connectedAt: null,
    endedAt: null,
  };

  // Write call doc to Firestore
  await setDoc(callDocRef, callData);

  // Play outgoing dialtone
  callAudioTones.playDialtone();

  // Listen for remote Answer and status updates
  const unsubDoc = onSnapshot(callDocRef, async (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data() as CallSession;

    if (data.status === 'connected' && data.answer && !peerConnection.currentRemoteDescription) {
      const rtcSessionDesc = new RTCSessionDescription(data.answer as RTCSessionDescriptionInit);
      await peerConnection.setRemoteDescription(rtcSessionDesc);
      onStatusChange('connected');
      callAudioTones.stop();
    } else if (data.status === 'declined') {
      onStatusChange('declined');
      callAudioTones.playEndCallTone();
      unsubDoc();
    } else if (data.status === 'ended') {
      onStatusChange('ended');
      callAudioTones.playEndCallTone();
      unsubDoc();
    } else if (data.status === 'busy') {
      onStatusChange('busy');
      callAudioTones.playEndCallTone();
      unsubDoc();
    }
  });

  // Listen for Callee ICE Candidates
  const unsubCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const candidateData = change.doc.data();
        if (candidateData?.candidate && peerConnection.remoteDescription) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
          } catch (e) {
            console.warn('Error adding callee ICE candidate:', e);
          }
        }
      }
    });
  });

  return { callId, peerConnection };
}

/**
 * Answers an incoming call session with SDP Answer and ICE candidates
 */
export async function answerCallSession(
  callSession: CallSession,
  localStream: MediaStream,
  onRemoteStream: (stream: MediaStream) => void,
  onStatusChange: (status: CallStatus) => void
): Promise<RTCPeerConnection> {
  const callDocRef = doc(db, 'calls', callSession.id);
  const peerConnection = new RTCPeerConnection(RTC_CONFIG);
  const remoteStream = new MediaStream();

  // Stop incoming ringtone
  callAudioTones.stop();

  // Add local stream tracks
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Handle incoming remote tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
    onRemoteStream(remoteStream);
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;
    if (state === 'connected') {
      onStatusChange('connected');
    } else if (state === 'disconnected' || state === 'failed') {
      onStatusChange('reconnecting');
    } else if (state === 'closed') {
      onStatusChange('ended');
    }
  };

  const callerCandidatesCol = collection(db, 'calls', callSession.id, 'callerCandidates');
  const calleeCandidatesCol = collection(db, 'calls', callSession.id, 'calleeCandidates');

  // Push callee ICE candidates
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      try {
        await addDoc(calleeCandidatesCol, {
          candidate: event.candidate.toJSON(),
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('Error adding callee candidate:', err);
      }
    }
  };

  // Set remote description (caller's offer)
  if (callSession.offer) {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(callSession.offer as RTCSessionDescriptionInit)
    );
  }

  // Create and set local answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  // Update call doc to connected with answer
  await updateDoc(callDocRef, {
    answer: {
      type: answer.type,
      sdp: answer.sdp || '',
    },
    status: 'connected',
    connectedAt: Date.now(),
  });

  onStatusChange('connected');

  // Listen for Caller ICE Candidates
  onSnapshot(callerCandidatesCol, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const candidateData = change.doc.data();
        if (candidateData?.candidate && peerConnection.remoteDescription) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
          } catch (e) {
            console.warn('Error adding caller candidate to callee:', e);
          }
        }
      }
    });
  });

  // Listen for remote call termination
  onSnapshot(callDocRef, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data() as CallSession;
    if (data.status === 'ended' || data.status === 'declined') {
      onStatusChange(data.status);
      callAudioTones.playEndCallTone();
    }
  });

  return peerConnection;
}

/**
 * Declines an incoming call
 */
export async function declineCallSession(callId: string): Promise<void> {
  callAudioTones.stop();
  callAudioTones.playEndCallTone();
  try {
    const callRef = doc(db, 'calls', callId);
    await updateDoc(callRef, {
      status: 'declined',
      endedAt: Date.now(),
    });
  } catch (err) {
    console.error('Error declining call session:', err);
  }
}

/**
 * Ends an active call
 */
export async function endCallSession(
  callId: string,
  durationSec = 0
): Promise<void> {
  callAudioTones.stop();
  callAudioTones.playEndCallTone();
  try {
    const callRef = doc(db, 'calls', callId);
    await updateDoc(callRef, {
      status: 'ended',
      endedAt: Date.now(),
      durationSec,
    });
  } catch (err) {
    console.error('Error ending call session:', err);
  }
}

/**
 * Subscribes in real-time to incoming calls directed to the current user
 */
export function subscribeToIncomingCalls(
  userId: string,
  onIncomingCall: (call: CallSession | null) => void
): Unsubscribe {
  try {
    const callsCol = collection(db, 'calls');
    // Only listen for offering/ringing calls created within the last 60 seconds
    const q = query(
      callsCol,
      where('receiverId', '==', userId),
      where('status', 'in', ['offering', 'ringing'])
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onIncomingCall(null);
          return;
        }

        // Get the latest pending call
        const activeCalls = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as CallSession))
          .filter((c) => Date.now() - (c.createdAt || 0) < 60000); // 60-second freshness window

        if (activeCalls.length > 0) {
          const latestCall = activeCalls[activeCalls.length - 1];
          onIncomingCall(latestCall);
          callAudioTones.playRingtone();
        } else {
          onIncomingCall(null);
        }
      },
      (err) => {
        console.warn('Incoming calls listener warning:', err);
      }
    );
  } catch (error) {
    console.error('Error setting up incoming calls listener:', error);
    return () => {};
  }
}
