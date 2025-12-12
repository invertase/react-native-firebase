import React, { useState } from 'react';
import { Button, Text, View, ScrollView, StyleSheet } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
} from '@react-native-firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, 'localhost', 5001);

export function StreamingCallableTestComponent(): React.JSX.Element {
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stopFunction, setStopFunction] = useState<(() => void) | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
    console.log(`[StreamingTest] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testBasicStream = async () => {
    try {
      addLog('🚀 Starting basic streaming test...');
      setIsStreaming(true);

      const functionRunner = httpsCallable(functions, 'testStreamingCallable');

      // Use the .stream() method
      const stop = functionRunner.stream(
        { count: 5, delay: 500 },
        event => {
          addLog(`📦 Received event: ${JSON.stringify(event)}`);

          if (event.done) {
            addLog('✅ Stream completed');
            setIsStreaming(false);
            setStopFunction(null);
          } else if (event.error) {
            addLog(`❌ Stream error: ${event.error}`);
            setIsStreaming(false);
            setStopFunction(null);
          } else if (event.data) {
            addLog(`📊 Data chunk: ${JSON.stringify(event.data)}`);
          }
        },
      );

      setStopFunction(() => stop);
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      setIsStreaming(false);
    }
  };

  const testProgressStream = async () => {
    try {
      addLog('📈 Starting progress streaming test...');
      setIsStreaming(true);

      const functionRunner = httpsCallable(functions, 'testProgressStream');

      const stop = functionRunner.stream({ task: 'TestTask' }, event => {
        if (event.done) {
          addLog('✅ Progress stream completed');
          setIsStreaming(false);
          setStopFunction(null);
        } else if (event.error) {
          addLog(`❌ Progress error: ${event.error}`);
          setIsStreaming(false);
          setStopFunction(null);
        } else if (event.data) {
          const data = event.data;
          if (data.progress !== undefined) {
            addLog(`⏳ Progress: ${data.progress}% - ${data.status}`);
          } else {
            addLog(`📊 Progress data: ${JSON.stringify(data)}`);
          }
        }
      });

      setStopFunction(() => stop);
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      setIsStreaming(false);
    }
  };

  const testComplexDataStream = async () => {
    try {
      addLog('🔧 Starting complex data streaming test...');
      setIsStreaming(true);

      const functionRunner = httpsCallable(functions, 'testComplexDataStream');

      const stop = functionRunner.stream({}, event => {
        if (event.done) {
          addLog('✅ Complex data stream completed');
          setIsStreaming(false);
          setStopFunction(null);
        } else if (event.error) {
          addLog(`❌ Complex data error: ${event.error}`);
          setIsStreaming(false);
          setStopFunction(null);
        } else if (event.data) {
          addLog(`🗂️ Complex data: ${JSON.stringify(event.data, null, 2)}`);
        }
      });

      setStopFunction(() => stop);
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      setIsStreaming(false);
    }
  };

  const testStreamFromUrl = async () => {
    try {
      addLog('🌐 Testing httpsCallableFromUrl streaming...');
      setIsStreaming(true);

      // Test httpsCallableFromUrl streaming with modular API
      // For emulator: http://localhost:5001/{projectId}/{region}/{functionName}
      const url = 'http://localhost:5001/test-project/us-central1/testStreamingCallable';
      const callableRef = httpsCallableFromUrl(functions, url);

      const stop = callableRef.stream({ count: 3, delay: 400 }, event => {
        if (event.done) {
          addLog('✅ URL stream completed');
          setIsStreaming(false);
          setStopFunction(null);
        } else if (event.error) {
          addLog(`❌ URL stream error: ${event.error}`);
          setIsStreaming(false);
          setStopFunction(null);
        } else if (event.data) {
          addLog(`📦 URL data: ${JSON.stringify(event.data)}`);
        }
      });

      setStopFunction(() => stop);
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      setIsStreaming(false);
    }
  };

  const testStreamWithOptions = async () => {
    try {
      addLog('⚙️ Testing stream with timeout option...');
      setIsStreaming(true);

      const callableRef = httpsCallable(functions, 'testStreamingCallable');

      const stop = callableRef.stream(
        { count: 3 },
        event => {
          if (event.done) {
            addLog('✅ Options stream completed');
            setIsStreaming(false);
            setStopFunction(null);
          } else if (event.error) {
            addLog(`❌ Options stream error: ${event.error}`);
            setIsStreaming(false);
            setStopFunction(null);
          } else if (event.data) {
            addLog(`📦 Options data: ${JSON.stringify(event.data)}`);
          }
        },
        { timeout: 30000 } // 30 second timeout
      );

      setStopFunction(() => stop);
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    if (stopFunction) {
      addLog('🛑 Stopping stream...');
      stopFunction();
      setStopFunction(null);
      setIsStreaming(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌊 Cloud Functions Streaming Tests</Text>
      <Text style={styles.subtitle}>Ensure Emulator is running on localhost:5001</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="📦 Basic Stream (5 chunks)"
          onPress={testBasicStream}
          disabled={isStreaming}
          color="#4CAF50"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="📈 Progress Stream"
          onPress={testProgressStream}
          disabled={isStreaming}
          color="#2196F3"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="🔧 Complex Data Stream"
          onPress={testComplexDataStream}
          disabled={isStreaming}
          color="#FF9800"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="🌐 Stream from URL"
          onPress={testStreamFromUrl}
          disabled={isStreaming}
          color="#9C27B0"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="⚙️ Stream with Options"
          onPress={testStreamWithOptions}
          disabled={isStreaming}
          color="#00BCD4"
        />
      </View>

      {isStreaming && (
        <View style={styles.buttonContainer}>
          <Button title="🛑 Stop Stream" onPress={stopStream} color="#D32F2F" />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="🗑️ Clear Logs" onPress={clearLogs} color="#757575" />
      </View>

      {logs.length > 0 && (
        <>
          <Text style={styles.logsTitle}>📜 Event Log:</Text>
          <ScrollView style={styles.logsContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logEntry}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </>
      )}

      {logs.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events yet. Start a stream test!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    marginVertical: 6,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    maxHeight: 400,
  },
  logEntry: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#00ff00',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

