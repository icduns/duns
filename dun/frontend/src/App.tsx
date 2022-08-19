import React, { useState } from 'react';
import { Alert, Button, Card, Input } from 'antd';
import { dun } from '@dun/decl';
import styles from './App.module.scss';

export function App() {
  const [name, setName] = useState<string>();
  const [result, setResult] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const handleSubmit = async () => {
    if (!name) {
      return;
    }

    try {
      setLoading(true);
      setResult(await dun.greet(name));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.app_container}>
      <Card>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <Button
          loading={loading}
          disabled={!name}
          style={{ marginTop: '12px' }}
          onClick={handleSubmit}
        >
          Sumbit
        </Button>

        {Boolean(result) && !loading && (
          <Alert message={result} style={{ marginTop: '32px' }} />
        )}
      </Card>
    </div>
  );
}
