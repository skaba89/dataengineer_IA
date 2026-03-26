'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Check, FileCode, FileText, Database } from 'lucide-react';

type CodeFile = {
  name: string;
  language: string;
  content: string;
  type: 'code' | 'sql' | 'config' | 'document';
};

type CodePreviewProps = {
  files: CodeFile[];
  title?: string;
};

const languageMap: Record<string, string> = {
  python: 'python',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  markdown: 'markdown',
  md: 'markdown',
  shell: 'bash',
  bash: 'bash',
};

const fileIconMap: Record<string, typeof FileCode> = {
  code: FileCode,
  sql: Database,
  config: FileText,
  document: FileText,
};

export function CodePreview({ files, title = 'Generated Code' }: CodePreviewProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (files[activeFile]) {
      await navigator.clipboard.writeText(files[activeFile].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (files[activeFile]) {
      const blob = new Blob([files[activeFile].content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files[activeFile].name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!files.length) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-8 text-center text-gray-400">
          <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No generated code</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">{title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-gray-600">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="border-gray-600">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFile.toString()} onValueChange={(v) => setActiveFile(parseInt(v))}>
          <TabsList className="bg-gray-900/50 h-auto flex-wrap gap-1">
            {files.map((file, index) => {
              const Icon = fileIconMap[file.type] || FileCode;
              return (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="data-[state=active]:bg-blue-600 text-xs px-2 py-1"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {file.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {files.map((file, index) => (
            <TabsContent key={index} value={index.toString()} className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {file.language.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {file.type}
                </Badge>
                <span className="text-xs text-gray-500 ml-auto">
                  {file.content.split('\n').length} lines
                </span>
              </div>
              <ScrollArea className="h-[400px] rounded-lg border border-gray-700">
                <SyntaxHighlighter
                  language={languageMap[file.language] || file.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    background: '#111827',
                    fontSize: '13px',
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {file.content}
                </SyntaxHighlighter>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Sample generated code for demo
export const sampleGeneratedFiles: CodeFile[] = [
  {
    name: 'customer_pipeline.py',
    language: 'python',
    type: 'code',
    content: `"""Customer Data Pipeline - Generated by AI Data Engineering System"""

from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-engineering',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'customer_data_pipeline',
    default_args=default_args,
    schedule_interval='0 6 * * *',
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:
    
    extract_customers = PythonOperator(
        task_id='extract_customers',
        python_callable=extract_customer_data,
    )
    
    load_to_warehouse = PythonOperator(
        task_id='load_to_warehouse',
        python_callable=load_to_data_warehouse,
    )
    
    extract_customers >> load_to_warehouse`,
  },
  {
    name: 'stg_customers.sql',
    language: 'sql',
    type: 'sql',
    content: `-- Staging model for customers
-- Generated by AI Data Engineering System

WITH source AS (
    SELECT * FROM raw.customers
),

cleaned AS (
    SELECT
        customer_id,
        LOWER(TRIM(email)) AS email,
        INITCAP(TRIM(first_name)) AS first_name,
        INITCAP(TRIM(last_name)) AS last_name,
        created_at,
        updated_at
    FROM source
    WHERE email IS NOT NULL
)

SELECT * FROM cleaned`,
  },
  {
    name: 'pipeline_config.yaml',
    language: 'yaml',
    type: 'config',
    content: `# Pipeline Configuration
# Generated by AI Data Engineering System

pipeline:
  name: customer_data_pipeline
  version: "1.0.0"
  
  schedule:
    cron: "0 6 * * *"
    timezone: "Europe/Paris"
    
  source:
    type: postgresql
    connection: postgres_prod
    database: production
    
  destination:
    type: bigquery
    project: data-warehouse-prod
    dataset: warehouse`,
  },
];

// Legacy exports for backwards compatibility
export const sampleAirflowDAG = sampleGeneratedFiles[0];
export const sampleDbtModel = sampleGeneratedFiles[1];
export const sampleYamlConfig = sampleGeneratedFiles[2];
