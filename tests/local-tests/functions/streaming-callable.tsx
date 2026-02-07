import React, { useState } from 'react';
import { Button, Text, View, ScrollView, StyleSheet, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
} from '@react-native-firebase/functions';

const functions = getFunctions(getApp());
connectFunctionsEmulator(functions, 'localhost', 5001);

export function StreamingCallableTestComponent(): React.JSX.Element {
  const [output, setOutput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const addOutput = (message: string) => {
    setOutput(prev => prev + message + '\n');
  };

  const testBasicStream = async () => {
    try {
      setIsStreaming(true);
      setOutput('');
      addOutput('Starting basic stream test...');

      const callable = httpsCallable(functions, 'testStreamingCallable');
      const { stream, data } = await callable.stream({ count: 5, delay: 500 });

      for await (const chunk of stream) {
        addOutput(`Chunk: ${JSON.stringify(chunk)}`);
      }
      const result = await data;
      addOutput(`Final result: ${JSON.stringify(result)}`);
      addOutput('✅ Stream completed');
    } catch (e: any) {
      addOutput(`❌ Error: ${e.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const testProgressStream = async () => {
    try {
      setIsStreaming(true);
      setOutput('');
      addOutput('Starting progress stream test...');

      const callable = httpsCallable(functions, 'testProgressStream') as any;
      const { stream, data } = await callable.stream({ task: 'TestTask' });

      for await (const chunk of stream) {
        if (chunk.progress !== undefined) {
          addOutput(`Progress: ${chunk.progress}% - ${chunk.status}`);
        } else {
          addOutput(`Data: ${JSON.stringify(chunk)}`);
        }
      }

      const result = await data;
      addOutput(`Final result: ${JSON.stringify(result)}`);
      addOutput('✅ Progress stream completed');
    } catch (e: any) {
      addOutput(`❌ Error: ${e.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const testComplexDataStream = async () => {
    try {
      setIsStreaming(true);
      setOutput('');
      addOutput('Starting complex data stream test...');

      const callable = httpsCallable(functions, 'testComplexDataStream');
      const { stream, data } = await callable.stream({});

      for await (const chunk of stream) {
        addOutput(`Complex data: ${JSON.stringify(chunk, null, 2)}`);
      }

      const result = await data;
      addOutput(`Final result: ${JSON.stringify(result)}`);
      addOutput('✅ Complex data stream completed');
    } catch (e: any) {
      addOutput(`❌ Error: ${e.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const testStreamFromUrl = async () => {
    try {
      setIsStreaming(true);
      setOutput('');
      addOutput('Starting URL stream test...');

      const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
      const url = `http://${host}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`;
      const callable = httpsCallableFromUrl(functions, url) as any;
      const { stream, data } = await callable.stream({ count: 3, delay: 400 });

      for await (const chunk of stream) {
        addOutput(`URL chunk: ${JSON.stringify(chunk)}`);
      }

      const result = await data;
      addOutput(`Final result: ${JSON.stringify(result)}`);
      addOutput('✅ URL stream completed');
    } catch (e: any) {
      addOutput(`❌ Error: ${e.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const testStreamWithOptions = async () => {
    try {
      setIsStreaming(true);
      setOutput('');
      addOutput('Starting stream with timeout option...');

      const callable = httpsCallable(functions, 'testStreamingCallable', { timeout: 4000 });
      const { stream, data } = await callable.stream(
        { count: 3 },
        { limitedUseAppCheckTokens: false },
      );

      for await (const chunk of stream) {
        addOutput(`Chunk: ${JSON.stringify(chunk)}`);
      }

      const result = await data;
      addOutput(`Final result: ${JSON.stringify(result)}`);
      addOutput('✅ Options stream completed');
    } catch (e: any) {
      addOutput(`❌ Error: ${e.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cloud Functions Streaming Tests</Text>
      <Text style={styles.subtitle}>Ensure Emulator is running on localhost:5001</Text>

      <View style={styles.buttonContainer}>
        <Button title="Basic Stream (5 chunks)" onPress={testBasicStream} disabled={isStreaming} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Progress Stream" onPress={testProgressStream} disabled={isStreaming} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Complex Data Stream"
          onPress={testComplexDataStream}
          disabled={isStreaming}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Stream from URL" onPress={testStreamFromUrl} disabled={isStreaming} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Stream with Options"
          onPress={testStreamWithOptions}
          disabled={isStreaming}
        />
      </View>

      {isStreaming && <Text style={styles.status}>Streaming...</Text>}

      {output && (
        <ScrollView style={styles.outputContainer}>
          <Text style={styles.outputText}>{output}</Text>
        </ScrollView>
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
  status: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  outputContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    maxHeight: 400,
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#00ff00',
  },
});
