# Menu de Navegação Lateral - Servinform Tools

## Visão Geral

Foi implementado um menu de navegação lateral esquerdo em todas as páginas do sistema Servinform Tools, permitindo aos usuários navegar facilmente entre as diferentes ferramentas sem precisar voltar à página principal.

## Funcionalidades

### 🎯 Navegação Rápida
- **Dashboard Principal**: Acesso direto à página principal de ferramentas
- **Trivalor**: Gerador de códigos QR para o sistema Trivalor
- **BCP Despesas**: Gerador de códigos QR para despesas
- **Split PDF**: Editor e separador de arquivos PDF
- **Conversor**: Conversor de imagens para PDF
- **Calculadora IVA**: Calculadora de IVA para despesas
- **Winzink Emails**: Organizador de emails (.eml) offline

### 🔧 Recursos do Menu
- **Menu Fixo**: Sempre visível e acessível
- **Indicador de Página Atual**: Mostra qual página está ativa
- **Responsivo**: Adapta-se a dispositivos móveis
- **Navegação Direta**: Acesso instantâneo a todas as ferramentas

## Como Usar

### 1. **Navegação**
- O menu está sempre visível no lado esquerdo da tela
- Clique em qualquer item do menu para navegar
- A página atual é destacada com cor verde
- Navegação instantânea entre ferramentas

### 2. **Responsividade**
- Em dispositivos móveis, o menu se adapta automaticamente
- Sempre acessível em todas as resoluções

## Arquivos Implementados

### CSS
- `/css/SidebarMenu.css` - Estilos do menu lateral

### JavaScript
- `/JScripts/SidebarMenu.js` - Funcionalidade do menu

### Páginas Atualizadas
- ✅ `ServinformSite.html` - Calculadora IVA
- ✅ `Tools.html` - Dashboard Principal
- ✅ `BCP.html` - Gerador QR Despesas
- ✅ `SplitPDF.html` - Editor PDF
- ✅ `Convert.html` - Conversor de Imagens
- ✅ `Trivalor.html` - Gerador QR Trivalor
- ✅ `winzinkemails.html` - Organizador de Emails

## Características Técnicas

### Design
- **Gradiente Azul**: Design moderno com cores da marca
- **Ícones Emoji**: Identificação visual clara das ferramentas
- **Animações**: Transições suaves e efeitos hover
- **Sombras**: Profundidade visual com box-shadows

### Funcionalidade
- **Auto-detecção**: Identifica automaticamente a página atual
- **Menu Fixo**: Sempre visível e acessível
- **Eventos**: Gerenciamento completo de cliques e navegação
- **Responsivo**: Adaptação automática para diferentes tamanhos de tela

### Compatibilidade
- **Navegadores Modernos**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet e mobile
- **Resoluções**: Adaptável a diferentes tamanhos de tela

## Benefícios para o Usuário

1. **Navegação Mais Rápida**: Acesso direto a qualquer ferramenta
2. **Melhor Experiência**: Não precisa voltar à página principal
3. **Contexto Visual**: Sempre sabe onde está no sistema
4. **Eficiência**: Reduz cliques e tempo de navegação
5. **Profissional**: Interface mais polida e moderna

## Manutenção

### Adicionar Nova Ferramenta
Para adicionar uma nova ferramenta ao menu:

1. Adicionar o link no arquivo `SidebarMenu.js`
2. Incluir o CSS e JS nas páginas HTML
3. Atualizar a lista de páginas implementadas

### Personalização
- Cores podem ser alteradas no arquivo CSS
- Ícones podem ser substituídos por FontAwesome ou outros
- Layout pode ser ajustado conforme necessário

## Suporte

Para dúvidas ou problemas com o menu lateral, consulte:
- Arquivo `SidebarMenu.js` para funcionalidade
- Arquivo `SidebarMenu.css` para estilos
- Este README para documentação

---

**Desenvolvido para Servinform PT**  
**Versão**: 1.0  
**Data**: 2024
