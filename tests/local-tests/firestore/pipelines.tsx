/* eslint-disable no-console */
import React, { useState } from 'react';
import { Button, View, Text, ScrollView, StyleSheet } from 'react-native';
import { getFirestore, doc, collection, Timestamp } from '@react-native-firebase/firestore';
import {
  execute,
  field,
  and,
  or,
  constant,
  countAll,
  sum,
  average,
  maximum,
  minimum,
  like,
  xor,
} from '@react-native-firebase/firestore/pipelines';

type SnippetFn = () => Promise<void>;

interface Snippet {
  name: string;
  run: SnippetFn;
}

export function PipelinesTestComponent() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);

  const db = getFirestore();

  const logResult = (name: string, data: unknown) => {
    const output = `[${name}]\n${JSON.stringify(data, null, 2)}`;
    console.log(output);
    setResult(output);
  };

  const logError = (name: string, error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);
    const output = `[${name}] Error:\n${msg}`;
    console.error(output);
    setResult(output);
  };

  const snippets: Snippet[] = [
    {
      name: 'basic_read',
      run: async () => {
        const pipeline = db.pipeline().collection('users');
        const snapshot = await execute(pipeline);
        logResult('basic_read', {
          count: snapshot.results.length,
          results: snapshot.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'collection_sort',
      run: async () => {
        const results = await execute(
          db.pipeline().collection('cities').sort(field('name').ascending()),
        );
        logResult('collection_sort', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'where_equality',
      run: async () => {
        const results = await execute(
          db.pipeline().collection('cities').where(field('state').equal('CA')),
        );
        logResult('where_equality', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'where_complex',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities')
            .where(
              or(
                like(field('name'), 'San%'),
                and(
                  field('location.state').charLength().greaterThan(7),
                  field('location.country').equal('USA'),
                ),
              ),
            ),
        );
        logResult('where_complex', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'aggregate_countAll',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities')
            .aggregate(countAll().as('total'), average('population').as('averagePopulation')),
        );
        logResult('aggregate_countAll', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'aggregate_group',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities')
            .aggregate({
              accumulators: [
                countAll().as('numberOfCities'),
                maximum('population').as('maxPopulation'),
              ],
              groups: ['country', 'state'],
            }),
        );
        logResult('aggregate_group', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'aggregate_sum',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities')
            .aggregate(field('population').sum().as('totalPopulation')),
        );
        logResult('aggregate_sum', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'select_fields',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities')
            .select(
              field('name').stringConcat(', ', field('location.country')).as('name'),
              'population',
            ),
        );
        logResult('select_fields', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'distinct',
      run: async () => {
        const results = await execute(db.pipeline().collection('cities').distinct('country'));
        logResult('distinct', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'limit_offset',
      run: async () => {
        const results = await execute(db.pipeline().collection('cities').limit(10).offset(5));
        logResult('limit_offset', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'addFields',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('users')
            .addFields(field('firstName').stringConcat(' ', field('lastName')).as('fullName')),
        );
        logResult('addFields', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'removeFields',
      run: async () => {
        const results = await execute(
          db.pipeline().collection('cities').removeFields('population', 'location.state'),
        );
        logResult('removeFields', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'sample',
      run: async () => {
        const results = await execute(db.pipeline().collection('cities').sample(3));
        logResult('sample', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'collectionGroup',
      run: async () => {
        const results = await execute(
          db.pipeline().collectionGroup('restaurants').sort(field('name').ascending()),
        );
        logResult('collectionGroup', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'database_all',
      run: async () => {
        const results = await execute(db.pipeline().database().aggregate(countAll().as('total')));
        logResult('database_all', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'documents_batch',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .documents([doc(db, 'cities', 'SF'), doc(db, 'cities', 'DC'), doc(db, 'cities', 'NY')]),
        );
        logResult('documents_batch', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'and_function',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .select(
              and(field('rating').greaterThan(4), field('price').lessThan(10)).as(
                'under10Recommendation',
              ),
            ),
        );
        logResult('and_function', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'or_function',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .select(
              or(field('genre').equal('Fantasy'), field('tags').arrayContains('adventure')).as(
                'matchesSearchFilters',
              ),
            ),
        );
        logResult('or_function', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'xor_function',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .select(
              xor(
                field('tags').arrayContains('magic'),
                field('tags').arrayContains('nonfiction'),
              ).as('matchesSearchFilters'),
            ),
        );
        logResult('xor_function', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'string_operations',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .select(
              field('title').stringConcat(' by ', field('author')).as('fullyQualifiedTitle'),
              field('title').toLower().as('lowercaseTitle'),
              field('title').toUpper().as('uppercaseTitle'),
            ),
        );
        logResult('string_operations', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'array_operations',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .select(
              field('genre').arrayLength().as('genreCount'),
              field('genre').arrayContains(constant('mystery')).as('isMystery'),
            ),
        );
        logResult('array_operations', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'math_operations',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .select(
              field('soldBooks').add(field('unsoldBooks')).as('totalBooks'),
              field('price').multiply(field('soldBooks')).as('revenue'),
              field('ratings').divide(field('soldBooks')).as('reviewRate'),
            ),
        );
        logResult('math_operations', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'min_max',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('books')
            .aggregate(
              field('price').minimum().as('minimumPrice'),
              field('price').maximum().as('maximumPrice'),
            ),
        );
        logResult('min_max', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'union',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities/SF/restaurants')
            .where(field('type').equal('Chinese'))
            .union(
              db
                .pipeline()
                .collection('cities/NY/restaurants')
                .where(field('type').equal('Italian')),
            )
            .where(field('rating').greaterThanOrEqual(4.5))
            .sort(field('__name__').descending()),
        );
        logResult('union', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'findNearest',
      run: async () => {
        const results = await execute(
          db
            .pipeline()
            .collection('cities')
            .findNearest({
              field: 'embedding',
              vectorValue: [1.5, 2.345],
              distanceMeasure: 'euclidean',
              limit: 10,
            }),
        );
        logResult('findNearest', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
    {
      name: 'unnest',
      run: async () => {
        const results = await execute(
          db.pipeline().collection('users').unnest(field('scores').as('userScore'), 'attempt'),
        );
        logResult('unnest', {
          count: results.results.length,
          results: results.results.map(r => ({ id: r.id, data: r.data() })),
        });
      },
    },
  ];

  const runSnippet = async (snippet: Snippet) => {
    setLoading(snippet.name);
    setResult('');
    try {
      await snippet.run();
    } catch (error) {
      logError(snippet.name, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Firestore Pipelines Tests</Text>
        <View style={styles.buttonsContainer}>
          {snippets.map((snippet, index) => (
            <View key={index} style={styles.buttonWrapper}>
              <Button
                title={loading === snippet.name ? `Running ${snippet.name}...` : snippet.name}
                onPress={() => runSnippet(snippet)}
                disabled={loading !== null}
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
    marginBottom: 16,
    marginTop: 60,
    textAlign: 'center',
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
    maxHeight: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
