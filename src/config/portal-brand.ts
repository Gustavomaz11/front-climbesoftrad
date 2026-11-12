const portalBrands = {
  sourad: {
    name: 'ClimbeSoftRad',
    productLabel: 'Central de laudos',
    initials: 'C',
    loginDescription: 'Acesse a fila de exames e a elaboração de laudos.',
    description: 'ClimbeSoftRad: recebimento de exames DICOM e elaboração de laudos.',
  },
  configuracoes: {
    name: 'Gestão',
    productLabel: 'Cadastros e configurações',
    initials: 'G',
    loginDescription: 'Acesse os cadastros de médicos, unidades e as configurações do software.',
    description: 'Gestão: cadastro de médicos, unidades, modalidades e configurações do software.',
  },
  hospital: {
    name: 'Hospital',
    productLabel: 'Preparação e envio de exames',
    initials: 'H',
    loginDescription: 'Acesse para conferir os dados e enviar exames para o ClimbeSoftRad.',
    description: 'Hospital: conferência e envio de exames DICOM para o ClimbeSoftRad.',
  },
} as const

export const getPortalBrand = (portal: string) =>
  portalBrands[portal as keyof typeof portalBrands] ?? portalBrands.sourad
