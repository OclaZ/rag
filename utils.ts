import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { batchsize } from "./config";

let callback: (
  filename: string,
  totalChunks: number,
  chunksUpserted: number,
  isComplete: boolean
) => void;
let totalDocumentChunks: number;
let totalDocumentChunksUpserted: number;
export async function updateVectorDB(
  client: Pinecone,
  indexName: string,
  namespace: string,
  docs: Document[],
  progressCallback: (
    filename: string,
    totalChunks: number,
    chunksUpserted: number,
    isComplete: boolean
  ) => void
) {
  callback = progressCallback;
  totalDocumentChunks = 0;
  totalDocumentChunksUpserted = 0;
  const modelname = "mixedbread-ai/mxbai-embed-large-v1";
  const extractor = await pipeline("feature-extraction", modelname, {
    quantized: false,
  });
  console.log(extractor);

  for (const doc of docs) {
    await prosessDocument(client, indexName, namespace, doc, extractor);
  }
  if (callback !== undefined) {
    callback(
      "filename",
      totalDocumentChunks,
      totalDocumentChunksUpserted,
      true
    );
  }
}
async function prosessDocument(
  client: Pinecone,
  indexName: string,
  namespace: string,
  doc: Document<Record<string, any>>,
  extractor: FeatureExtractionPipeline
) {
  const splitter = new RecursiveCharacterTextSplitter();
  const documentChunks = await splitter.splitText(doc.pageContent);
  totalDocumentChunks = documentChunks.length;
  totalDocumentChunksUpserted = 0;
  const filename = getFilename(doc.metadata?.filename);
  console.log(documentChunks.length);
  let chunkBatchIndex = 0;
  while (documentChunks.length > 0) {
    chunkBatchIndex++;
    const chunkBatch = documentChunks.splice(0, batchsize);
    await processOneBatch(
      client,
      indexName,
      namespace,
      extractor,
      chunkBatch,
      chunkBatchIndex,
      filename
    );
  }
}

function getFilename(filename: string | undefined): string {
  if (!filename) return "";
  const docName = filename.substring(filename.lastIndexOf("/") + 1);
  return docName.substring(0, docName.lastIndexOf(".")) || docName;
}
async function processOneBatch(
  client: Pinecone,
  indexName: string,
  namespace: string,
  extractor: FeatureExtractionPipeline,
  chunkBatch: string[],
  chunkBatchIndex: number,
  filename: string
) {
  const output = await extractor(
    chunkBatch.map((str) => str.replace(/\n/g, " ")),
    {
      pooling: "cls",
    }
  );
  const embeddingsBatch = output.tolist();
  let vectorBatch: PineconeRecord<RecordMetadata>[] = [];
  for (let i = 0; i < chunkBatch.length; i++) {
    const chunk = chunkBatch[i];
    const embedding = embeddingsBatch[i];

    const vector: PineconeRecord<RecordMetadata> = {
      id: `${filename}-${chunkBatchIndex}-${i}`,
      values: embedding,
      metadata: {
        chunk,
      },
    };

    vectorBatch.push(vector);
  }
  const index = client.Index(indexName).namespace(namespace);
  await index.upsert(vectorBatch);
  totalDocumentChunksUpserted += vectorBatch.length;
  if (callback !== undefined) {
    callback(filename, totalDocumentChunks, totalDocumentChunksUpserted, false);
  }
  vectorBatch = [];
}
