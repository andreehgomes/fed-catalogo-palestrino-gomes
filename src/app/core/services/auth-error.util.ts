/**
 * Traduz os códigos de erro do Firebase Auth (login com Google via popup)
 * para mensagens em português. Códigos desconhecidos são exibidos crus para
 * facilitar o diagnóstico em produção.
 */
export function mensagemErroLoginGoogle(erro: unknown): string {
  const code = (erro as { code?: string })?.code ?? '';

  const mensagens: Record<string, string> = {
    'auth/unauthorized-domain':
      'Este domínio não está autorizado no Firebase. Adicione "palestrinogomes.com.br" em Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed':
      'Login com Google não está habilitado no Firebase Console (Authentication → Sign-in method).',
    'auth/popup-blocked':
      'O navegador bloqueou a janela de login. Permita pop-ups para este site e tente novamente.',
    'auth/popup-closed-by-user': 'A janela de login foi fechada antes de concluir. Tente novamente.',
    'auth/cancelled-popup-request': 'Já existe uma janela de login aberta. Conclua-a ou tente novamente.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
    'auth/internal-error': 'Erro interno na autenticação. Tente novamente em instantes.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
  };

  return mensagens[code] ?? `Não foi possível entrar. (${code || 'erro desconhecido'})`;
}
