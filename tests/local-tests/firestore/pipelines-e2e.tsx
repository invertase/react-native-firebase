/* eslint-disable no-console */
import React, { useState } from 'react';
import { Button, View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from '@react-native-firebase/firestore';
import { execute, field, and } from '@react-native-firebase/firestore/pipelines';

const COLLECTION = 'firestore_pipeline_test';

function randString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type TestFn = () => Promise<string[]>;

interface TestCase {
  name: string;
  run: TestFn;
  androidOnly?: boolean;
}

export function PipelinesE2ETestComponent() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);
  // "default" database does not seem to work
  const db = getFirestore('firestore-pipeline-test');

  const tests: TestCase[] = [
    {
      name: 'serialize_source_builders',
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-order`;
        const collectionRef = collection(db, collectionName);

        const pipelineFromCollection = db
          .pipeline()
          .collection(collectionRef)
          .where(field('score').greaterThanOrEqual(10))
          .sort(field('score').descending())
          .limit({ n: 2 });

        const pipelineFromGroup = db.pipeline().collectionGroup('pipeline-order-sub');
        const pipelineFromDatabase = db.pipeline().database({ rawOptions: { explain: true } });
        const pipelineFromDocuments = db
          .pipeline()
          .documents([`${collectionName}/one`, `${collectionName}/two`]);

        const collectionSerialized = pipelineFromCollection.serialize();
        if (collectionSerialized.source.source === 'collection') {
          lines.push('✓ collection source serialized correctly');
        } else {
          lines.push(`✗ expected collection source, got ${collectionSerialized.source.source}`);
        }

        const groupSerialized = pipelineFromGroup.serialize();
        if (
          groupSerialized.source.source === 'collectionGroup' &&
          groupSerialized.source.collectionId === 'pipeline-order-sub'
        ) {
          lines.push('✓ collectionGroup source serialized correctly');
        } else {
          lines.push(
            `✗ collectionGroup serialization failed: ${JSON.stringify(groupSerialized.source)}`,
          );
        }

        const dbSerialized = pipelineFromDatabase.serialize();
        if (dbSerialized.source.source === 'database') {
          lines.push('✓ database source serialized correctly');
        } else {
          lines.push(`✗ expected database source, got ${dbSerialized.source.source}`);
        }

        const docsSerialized = pipelineFromDocuments.serialize();
        const documentCount = Array.isArray(docsSerialized.source.documents)
          ? docsSerialized.source.documents.length
          : undefined;
        if (docsSerialized.source.source === 'documents' && documentCount === 2) {
          lines.push('✓ documents source serialized correctly');
        } else {
          lines.push(`✗ documents serialization failed: ${JSON.stringify(docsSerialized.source)}`);
        }

        const stages = collectionSerialized.stages;
        if (stages.length === 3) {
          lines.push('✓ stages count is correct (3)');
          if (stages[0].stage === 'where') {
            lines.push('✓ first stage is where');
          }
          if (stages[1].stage === 'sort') {
            lines.push('✓ second stage is sort');
          }
          if (stages[2].stage === 'limit') {
            lines.push('✓ third stage is limit');
          }
        } else {
          lines.push(`✗ expected 3 stages, got ${stages.length}`);
        }

        return lines;
      },
    },
    {
      name: 'serialize_createFrom_query',
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-query`;
        const collectionRef = collection(db, collectionName);
        const querySource = query(
          collectionRef,
          where('score', '>=', 10),
          orderBy('score', 'desc'),
          limit(2),
        );

        const pipelineFromQuery = db.pipeline().createFrom(querySource);
        const serialized = pipelineFromQuery.serialize();

        if (serialized.source.source === 'query') {
          lines.push('✓ createFrom query source is "query"');
        } else {
          lines.push(`✗ expected query source, got ${serialized.source.source}`);
        }

        if (serialized.source.path === collectionRef.path) {
          lines.push('✓ query path matches collection path');
        } else {
          lines.push(`✗ path mismatch: ${serialized.source.path} vs ${collectionRef.path}`);
        }

        if (serialized.source.queryType === 'collection') {
          lines.push('✓ queryType is collection');
        } else {
          lines.push(`✗ expected queryType collection, got ${serialized.source.queryType}`);
        }

        const filterCount = Array.isArray(serialized.source.filters)
          ? serialized.source.filters.length
          : undefined;
        if (filterCount === 1) {
          lines.push('✓ filters has 1 item');
        } else {
          lines.push(`✗ expected 1 filter, got ${filterCount}`);
        }

        const orderCount = Array.isArray(serialized.source.orders)
          ? serialized.source.orders.length
          : undefined;
        if (orderCount === 1) {
          lines.push('✓ orders has 1 item');
        } else {
          lines.push(`✗ expected 1 order, got ${orderCount}`);
        }

        const queryLimit =
          serialized.source.options && typeof serialized.source.options === 'object'
            ? (serialized.source.options as Record<string, unknown>).limit
            : undefined;
        if (queryLimit === 2) {
          lines.push('✓ options.limit is 2');
        } else {
          lines.push(`✗ expected limit 2, got ${String(queryLimit)}`);
        }

        return lines;
      },
    },
    {
      name: 'validation_errors',
      run: async () => {
        const lines: string[] = [];

        try {
          db.pipeline().documents([]);
          lines.push('✗ documents([]) should have thrown');
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('expected at least one document')) {
            lines.push('✓ documents([]) throws correct error');
          } else {
            lines.push(`✗ wrong error for documents([]): ${msg}`);
          }
        }

        try {
          db.pipeline().collection('');
          lines.push('✗ collection("") should have thrown');
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('expected a non-empty string')) {
            lines.push('✓ collection("") throws correct error');
          } else {
            lines.push(`✗ wrong error for collection(""): ${msg}`);
          }
        }

        return lines;
      },
    },
    {
      name: 'execute_createFrom_query',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-query-exec`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'one'), { score: 10, active: true }),
          setDoc(doc(collectionRef, 'two'), { score: 21, active: true }),
          setDoc(doc(collectionRef, 'three'), { score: 5, active: false }),
        ]);

        const queryRef = query(
          collectionRef,
          where('active', '==', true),
          orderBy('score', 'desc'),
          limit(2),
        );
        const snapshot = await execute(db.pipeline().createFrom(queryRef));

        if (snapshot.results.length === 2) {
          lines.push('✓ results count is 2');
        } else {
          lines.push(`✗ expected 2 results, got ${snapshot.results.length}`);
        }

        if (snapshot.results[0].id === 'two') {
          lines.push('✓ first result id is "two"');
        } else {
          lines.push(`✗ expected first id "two", got ${snapshot.results[0].id}`);
        }

        if (snapshot.results[0].data().score === 21) {
          lines.push('✓ first result score is 21');
        } else {
          lines.push(`✗ expected score 21, got ${snapshot.results[0].data().score}`);
        }

        if (snapshot.results[1].id === 'one') {
          lines.push('✓ second result id is "one"');
        } else {
          lines.push(`✗ expected second id "one", got ${snapshot.results[1].id}`);
        }

        if (snapshot.results[1].data().score === 10) {
          lines.push('✓ second result score is 10');
        } else {
          lines.push(`✗ expected score 10, got ${snapshot.results[1].data().score}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_method_expressions',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-expression`;
        const collectionRef = collection(db, collectionName);
        console.log('collectionRef', collectionRef.path);
        await Promise.all([
          setDoc(doc(collectionRef, 'a'), { title: 'A', rating: 2, genre: 'Fantasy' }),
          setDoc(doc(collectionRef, 'b'), { title: 'B', rating: 5, genre: 'Fantasy' }),
          setDoc(doc(collectionRef, 'c'), { title: 'C', rating: 8, genre: 'Fantasy' }),
          setDoc(doc(collectionRef, 'd'), { title: 'D', rating: 9, genre: 'Sci-Fi' }),
        ]);
        console.log('collectionRef 222', collectionRef.path);
        const f = (path: string) => field(path);
        const pipeline = db
          .pipeline()
          .collection(collectionRef)
          .where(and(f('genre').equal('Fantasy'), f('rating').greaterThan(3)))
          .select(
            f('title').as('title'),
            f('rating').add(1).as('boostedRating'),
            f('genre').equal('Fantasy').as('isFantasy'),
          )
          .sort(f('rating').descending());

        const snapshot = await execute(pipeline);
        console.log('snapshot', snapshot);
        if (snapshot.results.length === 2) {
          lines.push('✓ results count is 2');
        } else {
          lines.push(`✗ expected 2 results, got ${snapshot.results.length}`);
        }

        const first = snapshot.results[0].data();
        if (first.title === 'C' && first.boostedRating === 9 && first.isFantasy === true) {
          lines.push('✓ first result data matches expected');
          lines.push(
            `  title: ${first.title}, boostedRating: ${first.boostedRating}, isFantasy: ${first.isFantasy}`,
          );
        } else {
          lines.push(`✗ first result mismatch: ${JSON.stringify(first)}`);
        }

        const second = snapshot.results[1].data();
        if (second.title === 'B' && second.boostedRating === 6 && second.isFantasy === true) {
          lines.push('✓ second result data matches expected');
          lines.push(
            `  title: ${second.title}, boostedRating: ${second.boostedRating}, isFantasy: ${second.isFantasy}`,
          );
        } else {
          lines.push(`✗ second result mismatch: ${JSON.stringify(second)}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_collection_basic',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-basic`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'doc1'), { name: 'Alice', age: 30 }),
          setDoc(doc(collectionRef, 'doc2'), { name: 'Bob', age: 25 }),
          setDoc(doc(collectionRef, 'doc3'), { name: 'Charlie', age: 35 }),
        ]);

        const pipeline = db.pipeline().collection(collectionRef);
        const snapshot = await execute(pipeline);

        if (snapshot.results.length === 3) {
          lines.push('✓ results count is 3');
        } else {
          lines.push(`✗ expected 3 results, got ${snapshot.results.length}`);
        }

        snapshot.results.forEach((result, i) => {
          lines.push(`  [${i}] id: ${result.id}, data: ${JSON.stringify(result.data())}`);
        });

        return lines;
      },
    },
    {
      name: 'execute_where_filter',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-where`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'doc1'), { name: 'Alice', age: 30, active: true }),
          setDoc(doc(collectionRef, 'doc2'), { name: 'Bob', age: 25, active: false }),
          setDoc(doc(collectionRef, 'doc3'), { name: 'Charlie', age: 35, active: true }),
        ]);

        const pipeline = db.pipeline().collection(collectionRef).where(field('active').equal(true));
        const snapshot = await execute(pipeline);

        if (snapshot.results.length === 2) {
          lines.push('✓ filtered results count is 2');
        } else {
          lines.push(`✗ expected 2 results, got ${snapshot.results.length}`);
        }

        const names = snapshot.results.map(r => r.data().name).sort();
        if (names.includes('Alice') && names.includes('Charlie')) {
          lines.push('✓ filtered results contain Alice and Charlie');
        } else {
          lines.push(`✗ expected Alice and Charlie, got ${names.join(', ')}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_select_fields',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-select`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'doc1'), { name: 'Alice', age: 30, email: 'alice@test.com' }),
          setDoc(doc(collectionRef, 'doc2'), { name: 'Bob', age: 25, email: 'bob@test.com' }),
        ]);

        const pipeline = db.pipeline().collection(collectionRef).select('name', 'age');
        const snapshot = await execute(pipeline);

        if (snapshot.results.length === 2) {
          lines.push('✓ results count is 2');
        } else {
          lines.push(`✗ expected 2 results, got ${snapshot.results.length}`);
        }

        const firstData = snapshot.results[0].data();
        const hasOnlySelectedFields =
          'name' in firstData && 'age' in firstData && !('email' in firstData);
        if (hasOnlySelectedFields) {
          lines.push('✓ select returned only name and age fields');
        } else {
          lines.push(`✗ unexpected fields in result: ${JSON.stringify(firstData)}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_sort_order',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-sort`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'doc1'), { name: 'Alice', score: 30 }),
          setDoc(doc(collectionRef, 'doc2'), { name: 'Bob', score: 50 }),
          setDoc(doc(collectionRef, 'doc3'), { name: 'Charlie', score: 10 }),
        ]);

        const pipelineAsc = db
          .pipeline()
          .collection(collectionRef)
          .sort(field('score').ascending());
        const snapshotAsc = await execute(pipelineAsc);

        const scoresAsc = snapshotAsc.results.map(r => r.data().score);
        if (scoresAsc[0] === 10 && scoresAsc[1] === 30 && scoresAsc[2] === 50) {
          lines.push('✓ ascending sort order correct: [10, 30, 50]');
        } else {
          lines.push(`✗ ascending sort failed: ${scoresAsc.join(', ')}`);
        }

        const pipelineDesc = db
          .pipeline()
          .collection(collectionRef)
          .sort(field('score').descending());
        const snapshotDesc = await execute(pipelineDesc);

        const scoresDesc = snapshotDesc.results.map(r => r.data().score);
        if (scoresDesc[0] === 50 && scoresDesc[1] === 30 && scoresDesc[2] === 10) {
          lines.push('✓ descending sort order correct: [50, 30, 10]');
        } else {
          lines.push(`✗ descending sort failed: ${scoresDesc.join(', ')}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_limit',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-limit`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'doc1'), { value: 1 }),
          setDoc(doc(collectionRef, 'doc2'), { value: 2 }),
          setDoc(doc(collectionRef, 'doc3'), { value: 3 }),
          setDoc(doc(collectionRef, 'doc4'), { value: 4 }),
          setDoc(doc(collectionRef, 'doc5'), { value: 5 }),
        ]);

        const pipeline = db.pipeline().collection(collectionRef).limit(3);
        const snapshot = await execute(pipeline);

        if (snapshot.results.length === 3) {
          lines.push('✓ limit(3) returned exactly 3 results');
        } else {
          lines.push(`✗ expected 3 results, got ${snapshot.results.length}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_aggregate',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-aggregate`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'doc1'), { category: 'A', value: 10 }),
          setDoc(doc(collectionRef, 'doc2'), { category: 'A', value: 20 }),
          setDoc(doc(collectionRef, 'doc3'), { category: 'B', value: 30 }),
        ]);

        const pipeline = db
          .pipeline()
          .collection(collectionRef)
          .aggregate(field('value').sum().as('totalValue'));
        const snapshot = await execute(pipeline);

        if (snapshot.results.length === 1) {
          lines.push('✓ aggregate returned 1 result');
        } else {
          lines.push(`✗ expected 1 result, got ${snapshot.results.length}`);
        }

        const totalValue = snapshot.results[0].data().totalValue;
        if (totalValue === 60) {
          lines.push('✓ sum aggregation correct: 60');
        } else {
          lines.push(`✗ expected sum 60, got ${totalValue}`);
        }

        return lines;
      },
    },
    {
      name: 'execute_documents_batch',
      androidOnly: true,
      run: async () => {
        const lines: string[] = [];
        const collectionName = `${COLLECTION}/${randString(12)}/pipeline-docs`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'alpha'), { letter: 'A' }),
          setDoc(doc(collectionRef, 'beta'), { letter: 'B' }),
          setDoc(doc(collectionRef, 'gamma'), { letter: 'C' }),
        ]);

        const pipeline = db
          .pipeline()
          .documents([doc(collectionRef, 'alpha'), doc(collectionRef, 'gamma')]);
        const snapshot = await execute(pipeline);

        if (snapshot.results.length === 2) {
          lines.push('✓ documents batch returned 2 results');
        } else {
          lines.push(`✗ expected 2 results, got ${snapshot.results.length}`);
        }

        const ids = snapshot.results.map(r => r.id).sort();
        if (ids.includes('alpha') && ids.includes('gamma')) {
          lines.push('✓ returned documents are alpha and gamma');
        } else {
          lines.push(`✗ expected alpha and gamma, got ${ids.join(', ')}`);
        }

        return lines;
      },
    },
  ];

  const runTest = async (test: TestCase) => {
    if (test.androidOnly && Platform.OS !== 'android') {
      setResult(`[${test.name}]\n⚠ Skipped: Android only test`);
      return;
    }

    setLoading(test.name);
    setResult('');
    try {
      const lines = await test.run();
      const output = `[${test.name}]\n${lines.join('\n')}`;
      console.log(output);
      setResult(output);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const output = `[${test.name}] Error:\n${msg}`;
      console.error(output);
      setResult(output);
    } finally {
      setLoading(null);
    }
  };

  const runAllTests = async () => {
    setLoading('all');
    const allResults: string[] = [];

    for (const test of tests) {
      if (test.androidOnly && Platform.OS !== 'android') {
        allResults.push(`[${test.name}]\n⚠ Skipped: Android only test\n`);
        continue;
      }

      try {
        const lines = await test.run();
        allResults.push(`[${test.name}]\n${lines.join('\n')}\n`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        allResults.push(`[${test.name}] Error:\n${msg}\n`);
      }
    }

    const output = allResults.join('\n');
    console.log(output);
    setResult(output);
    setLoading(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Firestore Pipelines E2E Tests</Text>
        <Text style={styles.subheader}>Platform: {Platform.OS}</Text>

        <View style={styles.runAllContainer}>
          <Button
            title={loading === 'all' ? 'Running all tests...' : 'Run All Tests'}
            onPress={runAllTests}
            disabled={loading !== null}
            color="#4CAF50"
          />
        </View>

        <View style={styles.buttonsContainer}>
          {tests.map((test, index) => (
            <View key={index} style={styles.buttonWrapper}>
              <Button
                title={
                  loading === test.name
                    ? `Running...`
                    : `${test.name}${test.androidOnly ? ' (Android)' : ''}`
                }
                onPress={() => runTest(test)}
                disabled={loading !== null}
                color={test.androidOnly ? '#FF9800' : '#2196F3'}
              />
            </View>
          ))}
        </View>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultHeader}>Result:</Text>
            <ScrollView style={styles.resultScroll} nestedScrollEnabled>
              <Text style={styles.resultText}>{result}</Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 60,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  runAllContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buttonWrapper: {
    margin: 4,
  },
  resultContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 16,
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultScroll: {
    maxHeight: 400,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
