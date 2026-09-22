import { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

// Any public remote/live stream. Replace with any slow-to-start stream if this one is
// unavailable from your network.
const LIVE_STREAM = 'https://ice1.somafm.com/groovesalad-128-mp3';

export default function App() {
  const player = useAudioPlayer({ uri: LIVE_STREAM }, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const requestedAt = useRef(null);
  const [timeToStart, setTimeToStart] = useState(null);

  useEffect(() => {
    // Match "create a player and immediately call play()": the call happens before the
    // underlying AVPlayerItem has reached readyToPlay.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    requestedAt.current = Date.now();
    player.play();
  }, [player]);

  useEffect(() => {
    if (status.playing && requestedAt.current != null && timeToStart == null) {
      setTimeToStart((Date.now() - requestedAt.current) / 1000);
    }
  }, [status.playing, timeToStart]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>expo-audio iOS live-start repro</Text>

      <View style={styles.status}>
        <Row label="playbackState" value={status.playbackState} />
        <Row label="timeControlStatus" value={status.timeControlStatus} />
        <Row label="reasonForWaitingToPlay" value={status.reasonForWaitingToPlay} />
        <Row label="isLoaded" value={String(status.isLoaded)} />
        <Row label="playing" value={String(status.playing)} />
        <Row label="isBuffering" value={String(status.isBuffering)} />
        <Row
          label="time from play() to actual playback"
          value={timeToStart == null ? 'still waiting…' : `${timeToStart.toFixed(2)}s`}
        />
      </View>

      <Button title="play()" onPress={() => player.play()} />
      <Button title="pause()" onPress={() => player.pause()} />

      <StatusBar style="auto" />
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 96,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  status: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flexShrink: 1,
    color: '#555',
  },
  value: {
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
});
