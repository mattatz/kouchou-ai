'use client'

import {Header} from '@/components/Header'
import {
  Box,
  Button,
  Field,
  Heading, HStack,
  Input,
  NativeSelect,
  Presence,
  Textarea,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import {FileUploadDropzone, FileUploadList, FileUploadRoot} from '@/components/ui/file-upload'
import {useState} from 'react'
import {StepperInput} from '@/components/ui/stepper-input'
import {parseCsv} from '@/app/create/parseCsv'
import {useRouter} from 'next/navigation'
import {toaster} from '@/components/ui/toaster'
import {defaultPrompt} from './defaultPrompt'

export default function Page() {
  const router = useRouter()
  const { open, onToggle } = useDisclosure()
  const [loading, setLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [intro, setIntro] = useState<string>('')
  const [csv, setCsv] = useState<File | null>(null)
  const [model, setModel] = useState<string>('gpt-4o')
  const [clusterNum, setClusterNum] = useState<string>('3')
  const [prompt, setPrompt] = useState<string>(defaultPrompt)

  async function onSubmit() {
    setLoading(true)
    const precheck = [
      /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(input),
      question.length > 0,
      intro.length > 0,
      clusterNum.length > 0,
      model.length > 0,
      prompt.length > 0,
      !!csv
    ].every(Boolean)
    if (!precheck) {
      toaster.create({
        // placement: 'bottom',
        type: 'error',
        title: '入力エラー',
        description: '全ての項目が入力されているか確認してください',
      })
      setLoading(false)
      return
    }
    let comments = []
    try {
      comments = await parseCsv(csv!)
    } catch (e) {
      toaster.create({
        type: 'error',
        title: 'CSVファイルの読み込みに失敗しました',
        description: e as string,
      })
      setLoading(false)
      return
    }
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/admin/reports', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input,
          question,
          intro,
          comments,
          clusterNum: Number(clusterNum),
          model,
          prompt
        })
      })
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      toaster.create({
        duration: 5000,
        type: 'success',
        title: 'レポート作成を開始しました',
        description: '処理状況はダッシュボードを更新して確認してください',
      })
      router.replace('/')
    } catch (e) {
      console.error(e)
      toaster.create({
        duration: 5000,
        type: 'error',
        title: 'レポート作成に失敗しました',
        description: '問題が解決しない場合は開発者に問い合わせください',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={'container'}>
      <Header />
      <Box mx={'auto'} maxW={'800px'}>
        <Heading textAlign={'center'} my={10}>新しいレポートを作成する</Heading>
        <VStack gap={5}>
          <Field.Root>
            <Field.Label>ID</Field.Label>
            <Input
              w={'40%'}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="例：example"
            />
            <Field.HelperText>英字小文字と数字とハイフンのみ</Field.HelperText>
          </Field.Root>
          <Field.Root>
            <Field.Label>タイトル</Field.Label>
            <Input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="例：人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？"
            />
            <Field.HelperText>レポートのタイトルを記載します</Field.HelperText>
          </Field.Root>
          <Field.Root>
            <Field.Label>調査概要</Field.Label>
            <Input
              value={intro}
              onChange={e => setIntro(e.target.value)}
              placeholder="例：このAI生成レポートは、パブリックコメントにおいて寄せられた意見に基づいています。"
            />
            <Field.HelperText>コメントの集計期間や、コメントの収集元など、調査の概要を記載します</Field.HelperText>
          </Field.Root>
          <Field.Root>
            <Field.Label>コメントファイル</Field.Label>
            <FileUploadRoot
              w={'full'}
              alignItems="stretch"
              accept={['text/csv']}
              onFileChange={(e) => setCsv(e.acceptedFiles[0])}
            >
              <FileUploadDropzone
                label="分析するコメントファイルを選択してください"
                description=".csv"
              />
              <FileUploadList />
            </FileUploadRoot>
            <Field.HelperText>カラムに id と body を含む CSVファイルが必要です</Field.HelperText>
          </Field.Root>
          <HStack justify={'flex-end'} w={'full'}>
            <Button onClick={onToggle} variant={'outline'} w={'200px'}>
              AI詳細設定 (オプション)
            </Button>
          </HStack>
          <Presence present={open} w={'full'}>
            <VStack gap={5}>
              <Field.Root>
                <Field.Label>クラスター深度</Field.Label>
                <HStack>
                  <StepperInput value={clusterNum} onValueChange={(e) => setClusterNum(e.value)} />
                </HStack>
                <Field.HelperText>
                  クラスタリングの階層数です (階層が増えるとクラスター総数は指数的に増加します)
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>AIモデル</Field.Label>
                <NativeSelect.Root w={'40%'}>
                  <NativeSelect.Field value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value={'gpt-4o'}>OpenAI GPT-4o</option>
                    <option value={'gpt-4o-mini'}>OpenAI GPT-4o mini</option>
                    <option value={'o1'}>OpenAI o1</option>
                    <option value={'o3-mini'}>OpenAI o3-mini</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator/>
                </NativeSelect.Root>
                <Field.HelperText>
                  {model === 'gpt-4o' && 'GPT-4oの特徴：すごいモデルです'}
                  {model === 'gpt-4o-mini' && 'GPT-4o miniの特徴：すごいモデルです'}
                  {model === 'o1' && 'o1の特徴：すごいモデルです'}
                  {model === 'o3-mini' && 'o3-miniの特徴：すごいモデルです'}
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>プロンプト</Field.Label>
                <Textarea
                  h={'150px'}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Field.HelperText>
                  AIに提示するプロンプトです(通常は変更不要です)
                </Field.HelperText>
              </Field.Root>
            </VStack>
          </Presence>
          <Button
            mt={10}
            className={'gradientBg shadow'}
            size={'2xl'}
            w={'300px'}
            onClick={onSubmit}
            loading={loading}
          >レポート作成を開始</Button>
        </VStack>
      </Box>
    </div>
  )
}
