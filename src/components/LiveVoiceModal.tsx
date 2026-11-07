import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Radio, Sparkles, X, ShieldAlert, Activity } from 'lucide-react';
import { sounds } from '../services/sound.ts';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Connecting to Gemini 3.8 Live...');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    startLiveSession();

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsMicActive(false);
    setIsAiSpeaking(false);
  };

  const startLiveSession = async () => {
    setError(null);
    setStatusText('Connecting to gemini-3.8-live session...');

    try {
      // 1. Initialize output AudioContext at 24000Hz as required by Gemini Live
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      outputCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      nextStartTimeRef.current = outputCtxRef.current.currentTime;

      // 2. Connect WebSocket to /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText('Connected to Gemini 3.8 Live! Turn on microphone to speak.');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setError(msg.error);
            setStatusText('Connection error');
          }
          if (msg.audio && outputCtxRef.current) {
            setIsAiSpeaking(true);
            playAudioChunk(outputCtxRef.current, msg.audio);

            if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = setTimeout(() => {
              setIsAiSpeaking(false);
            }, 1200);
          }
          if (msg.interrupted) {
            setIsAiSpeaking(false);
            if (outputCtxRef.current) {
              nextStartTimeRef.current = outputCtxRef.current.currentTime;
            }
          }
        } catch (e) {
          console.error('Error handling live ws message', e);
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection to Live API failed. Check server status.');
        setStatusText('Disconnected');
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Live audio session');
    }
  };

  const toggleMicrophone = async () => {
    sounds.playClick();
    if (isMicActive) {
      // Disable mic
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsMicActive(false);
      setStatusText('Microphone muted. Tap mic to talk.');
      return;
    }

    // Enable mic: capture 16kHz mono audio
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      inputCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      if (inputCtxRef.current.state === 'suspended') {
        await inputCtxRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const source = inputCtxRef.current.createMediaStreamSource(stream);
      const processor = inputCtxRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtxRef.current.destination);

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const channelData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to 16-bit PCM little-endian
        const pcm16 = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          const s = Math.max(-1, Math.min(1, channelData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert PCM buffer to base64
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        wsRef.current.send(JSON.stringify({ audio: base64 }));
      };

      setIsMicActive(true);
      setStatusText('Listening... Speak naturally to the AI Interrogator.');
    } catch (err: any) {
      setError(err?.message || 'Could not access microphone');
    }
  };

  const playAudioChunk = (ctx: AudioContext, base64: string) => {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 0x7fff;
      }

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
    } catch (e) {
      console.error('Failed to decode/play PCM audio chunk', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-slate-100 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Live Voice Interrogator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  gemini-3.8-live
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Real-time low-latency voice conversation with Gemini Live API
              </p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer Pulsing Orb */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer ripples */}
            <div
              className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
                isAiSpeaking
                  ? 'bg-cyan-500/20 scale-125 animate-ping'
                  : isMicActive
                  ? 'bg-purple-500/20 scale-110 animate-pulse'
                  : 'bg-slate-800/20'
              }`}
            />
            <div
              className={`relative w-28 h-28 rounded-full flex items-center justify-center border transition-all duration-300 shadow-2xl ${
                isAiSpeaking
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-800 border-cyan-400 shadow-cyan-500/50 scale-110'
                  : isMicActive
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-800 border-purple-400 shadow-purple-500/50'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              {isAiSpeaking ? (
                <Volume2 className="w-12 h-12 text-white animate-bounce" />
              ) : isMicActive ? (
                <Activity className="w-10 h-10 text-white animate-pulse" />
              ) : (
                <Radio className="w-10 h-10 text-slate-600" />
              )}
            </div>
          </div>

          <div className="mt-4">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${
              isAiSpeaking ? 'text-cyan-400' : isMicActive ? 'text-purple-400' : 'text-slate-400'
            }`}>
              {isAiSpeaking ? 'Interrogator Speaking...' : isMicActive ? 'Listening to You...' : 'Standby'}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              {statusText}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          <button
            onClick={toggleMicrophone}
            disabled={!isConnected}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              isMicActive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/30'
            } disabled:opacity-40`}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMicActive ? 'Mute Microphone' : 'Start Speaking'}</span>
          </button>

          <p className="text-[11px] text-slate-500 font-mono">
            Talk to interrogator to cross-examine suspects or test secret word clues in real time.
          </p>
        </div>
      </div>
    </div>
  );
};
