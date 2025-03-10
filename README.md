# shotokutaishi
デジタル民主主義2030プロジェクトにおいて、ブロードリスニングを実現するためのアプリケーションです。

## 前提条件
* docker, docker-compose
* OpenAI APIキー

## セットアップ・起動
* リポジトリをクローン
* `cp .env.example .env` をコンソールで実行
  * コピー後に各環境変数を設定。各環境変数の意味は.env.exampleに記載。
* `docker-compose up` をコンソールで実行
  * ブラウザで http://localhost:3000 にアクセスすることで管理画面にアクセス可能
  * ブラウザで http://localhost:4000 にアクセスすることでレポート一覧画面にアクセス可能

## アーキテクチャ概要
本システムは以下のサービスで構成されています。


### api (server)
- ポート: 8000
- 役割: バックエンドAPIサービス
- 主要機能:
  - レポートデータの取得・管理
  - レポート生成パイプラインの実行
  - 管理用APIの提供
- 技術スタック:
  - Python (FastAPI)
  - Docker

### client
- ポート: 3000
- 役割: レポート表示用フロントエンド
- 主要機能:
  - レポートの可視化
  - インタラクティブなデータ分析
  - ユーザーフレンドリーなインターフェース
- 技術スタック:
  - Next.js
  - TypeScript
  - Docker

### client-admin
- ポート: 4000
- 役割: 管理用フロントエンド
- 主要機能:
  - レポートの作成・編集
  - パイプライン設定の管理
  - システム設定の管理
- 技術スタック:
  - Next.js
  - TypeScript
  - Docker

### utils/dummy-server
- 役割: 開発用ダミーAPI
- 用途: 開発環境でのAPIモックとして使用


## 免責事項
大規模言語モデル（LLM）にはバイアスがあり、信頼性の低い結果を生成することが知られています。私たちはこれらの問題を軽減する方法に積極的に取り組んでいますが、現段階ではいかなる保証も提供することはできません。重要な決定を行う際には、まず結果を検証せずにこのパイプラインの結果のみに依存することはお勧めしません。
