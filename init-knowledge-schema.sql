\c opsmind_knowledge;
CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;

CREATE TABLE IF NOT EXISTS project_vectors (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,  
    content TEXT NOT NULL,                     
    embedding VECTOR(1536) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_vectors_diskann 
ON project_vectors USING diskann (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_project_vectors_project_id 
ON project_vectors (project_id);