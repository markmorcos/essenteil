CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    categories TEXT[] NOT NULL DEFAULT '{}',
    location JSONB NOT NULL,
    image_url TEXT,
    contact JSONB NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX listings_user_id_idx ON listings(user_id);
CREATE INDEX listings_active_idx ON listings(active);
CREATE INDEX listings_expires_at_idx ON listings(expires_at);
CREATE INDEX listings_categories_gin ON listings USING GIN (categories);
