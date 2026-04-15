CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(200) UNIQUE,
    password TEXT
);

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    isbooked INT DEFAULT 0,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 20);