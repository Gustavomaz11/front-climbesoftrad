export const statuses = {
  PREPARING: 'Preparando imagens e ocultando textos localmente',
  REVIEW: 'Conferência de anonimização',
  QUEUED: 'Aguardando análise de pesquisa',
  RUNNING: 'Analisando imagens anonimizadas',
  COMPLETED: 'Pesquisa concluída',
  FAILED: 'Não foi possível concluir',
  STALE: 'O exame recebeu alterações',
}
export const errors: Record<string, string> = {
  FRAME_LIMIT_EXCEEDED:
    'O exame excede o limite de imagens configurado. Nenhuma imagem foi enviada ao Gemini.',
  SOURCE_CHANGED: 'O exame mudou. Prepare uma nova pesquisa com todas as imagens.',
  GEMINI_UNAVAILABLE: 'O Gemini está indisponível. A pesquisa não foi concluída.',
  GEMINI_TIMEOUT: 'O Gemini não respondeu dentro do prazo. Você pode retomar a análise.',
  GEMINI_NETWORK_ERROR: 'A conexão com o Gemini foi interrompida. Você pode retomar a análise.',
  GEMINI_TLS_ERROR: 'A conexão segura com o Gemini não foi validada. Verifique os certificados do servidor.',
  GEMINI_TEMPORARILY_UNAVAILABLE: 'O Gemini está temporariamente indisponível. Aguarde e retome a análise.',
  GEMINI_ACCESS_DENIED: 'O Gemini recusou o acesso. Verifique a chave e as permissões do projeto.',
  GEMINI_REQUEST_REJECTED: 'O Gemini rejeitou a solicitação. Verifique a configuração da integração.',
  GEMINI_QUOTA_EXCEEDED:
    'O projeto do Gemini está sem cota disponível. Verifique os limites e o faturamento no Google AI Studio antes de tentar novamente.',
  LOCAL_OCR_FAILED: 'Não foi possível concluir a ocultação local de textos.',
  PROCESS_INTERRUPTED: 'O processamento foi interrompido. Prepare uma nova pesquisa.',
  COVERAGE_INCOMPLETE: 'A resposta não cobriu todas as imagens. A pesquisa não foi concluída.',
}
