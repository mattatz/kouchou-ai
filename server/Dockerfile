FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY pyproject.toml requirements.lock requirements-dev.lock README.md ./
RUN uv pip install --no-cache --system -r requirements.lock

COPY . .
# アプリケーションの実行
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
