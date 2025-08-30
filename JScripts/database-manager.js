/**
 * Sistema de Gerenciamento de Banco de Dados para Usuários SVF
 * Suporta Excel como fonte principal e localStorage como backup
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'SVF_Users_DB';
        this.users = this.loadUsers();
        this.initializeDatabase();
    }

    /**
     * Inicializa o banco de dados com usuários padrão se estiver vazio
     */
    initializeDatabase() {
        if (this.users.length === 0) {
            this.users = [
                {
                    id: 1,
                    usuario: 'JanyelSVF',
                    email: 'janyel@servinform.com',
                    senha: 'SVF_010203',
                    dataCriacao: '2024-01-01',
                    status: 'Ativo',
                    tipo: 'Administrador'
                },
                {
                    id: 2,
                    usuario: 'HenriqueSVF',
                    email: 'henrique@servinform.com',
                    senha: 'SVF_020304',
                    dataCriacao: '2024-01-01',
                    status: 'Ativo',
                    tipo: 'Administrador'
                },
                {
                    id: 3,
                    usuario: 'TABSVF',
                    email: 'tab@servinform.com',
                    senha: 'SVF_030405',
                    dataCriacao: '2024-01-01',
                    status: 'Ativo',
                    tipo: 'Usuário'
                },
                {
                    id: 4,
                    usuario: 'AnisabelN',
                    email: 'anisabel@servinform.com',
                    senha: 'SVF_040506',
                    dataCriacao: '2024-01-01',
                    status: 'Ativo',
                    tipo: 'Usuário'
                },
                {
                    id: 5,
                    usuario: 'SRITA',
                    email: 'srita@servinform.com',
                    senha: 'SVF_060708',
                    dataCriacao: '2024-01-01',
                    status: 'Ativo',
                    tipo: 'Usuário'
                }
            ];
            this.saveUsers();
        }
    }

    /**
     * Carrega usuários do localStorage
     */
    loadUsers() {
        try {
            const stored = localStorage.getItem(this.dbName);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return [];
        }
    }

    /**
     * Salva usuários no localStorage
     */
    saveUsers() {
        try {
            localStorage.setItem(this.dbName, JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('Erro ao salvar usuários:', error);
            return false;
        }
    }

    /**
     * Busca usuário por nome de usuário
     */
    findUserByUsername(username) {
        return this.users.find(user => 
            user.usuario.toLowerCase() === username.toLowerCase() && 
            user.status === 'Ativo'
        );
    }

    /**
     * Busca usuário por email
     */
    findUserByEmail(email) {
        return this.users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.status === 'Ativo'
        );
    }

    /**
     * Verifica se o usuário existe
     */
    userExists(username, email) {
        return this.findUserByUsername(username) || this.findUserByEmail(email);
    }

    /**
     * Valida credenciais de login
     */
    validateLogin(username, password) {
        const user = this.findUserByUsername(username);
        if (user && user.senha === password) {
            return {
                success: true,
                user: {
                    id: user.id,
                    usuario: user.usuario,
                    email: user.email,
                    tipo: user.tipo,
                    dataCriacao: user.dataCriacao
                }
            };
        }
        return { success: false, message: 'Usuário ou senha inválidos' };
    }

    /**
     * Registra novo usuário
     */
    registerUser(userData) {
        // Validações
        if (!userData.usuario || userData.usuario.length < 3) {
            return { success: false, message: 'Usuário deve ter pelo menos 3 caracteres' };
        }

        if (!userData.email || !this.isValidEmail(userData.email)) {
            return { success: false, message: 'Email inválido' };
        }

        if (!userData.senha || userData.senha.length < 6) {
            return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
        }

        // Verifica se usuário já existe
        if (this.userExists(userData.usuario, userData.email)) {
            return { success: false, message: 'Usuário ou email já existe' };
        }

        // Cria novo usuário
        const newUser = {
            id: this.getNextId(),
            usuario: userData.usuario,
            email: userData.email,
            senha: userData.senha,
            dataCriacao: new Date().toISOString().split('T')[0],
            status: 'Ativo',
            tipo: 'Usuário'
        };

        // Adiciona ao array
        this.users.push(newUser);

        // Salva no localStorage
        if (this.saveUsers()) {
            return {
                success: true,
                message: 'Usuário registrado com sucesso!',
                user: {
                    id: newUser.id,
                    usuario: newUser.usuario,
                    email: newUser.email,
                    tipo: newUser.tipo
                }
            };
        } else {
            return { success: false, message: 'Erro ao salvar usuário' };
        }
    }

    /**
     * Gera próximo ID disponível
     */
    getNextId() {
        return this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    }

    /**
     * Valida formato de email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Atualiza dados do usuário
     */
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        // Atualiza apenas campos permitidos
        const allowedFields = ['email', 'senha', 'status', 'tipo'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                this.users[userIndex][field] = updates[field];
            }
        });

        if (this.saveUsers()) {
            return { success: true, message: 'Usuário atualizado com sucesso!' };
        } else {
            return { success: false, message: 'Erro ao salvar alterações' };
        }
    }

    /**
     * Desativa usuário (soft delete)
     */
    deactivateUser(userId) {
        return this.updateUser(userId, { status: 'Inativo' });
    }

    /**
     * Lista todos os usuários ativos
     */
    getActiveUsers() {
        return this.users.filter(user => user.status === 'Ativo');
    }

    /**
     * Exporta dados para formato compatível com Excel
     */
    exportToCSV() {
        const headers = ['ID', 'Usuário', 'Email', 'Senha', 'Data Criação', 'Status', 'Tipo'];
        const csvContent = [
            headers.join(','),
            ...this.users.map(user => [
                user.id,
                user.usuario,
                user.email,
                user.senha,
                user.dataCriacao,
                user.status,
                user.tipo
            ].join(','))
        ].join('\n');

        // Cria arquivo para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'usuarios_svf.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Importa dados de arquivo CSV
     */
    importFromCSV(csvContent) {
        try {
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            const newUsers = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',');
                    const user = {
                        id: parseInt(values[0]) || this.getNextId(),
                        usuario: values[1] || '',
                        email: values[2] || '',
                        senha: values[3] || '',
                        dataCriacao: values[4] || new Date().toISOString().split('T')[0],
                        status: values[5] || 'Ativo',
                        tipo: values[6] || 'Usuário'
                    };
                    newUsers.push(user);
                }
            }

            // Adiciona novos usuários
            this.users = [...this.users, ...newUsers];
            this.saveUsers();

            return { success: true, message: `${newUsers.length} usuários importados com sucesso!` };
        } catch (error) {
            return { success: false, message: 'Erro ao importar arquivo CSV' };
        }
    }

    /**
     * Estatísticas do banco
     */
    getStats() {
        const total = this.users.length;
        const ativos = this.users.filter(u => u.status === 'Ativo').length;
        const inativos = total - ativos;
        const admins = this.users.filter(u => u.tipo === 'Administrador').length;
        const usuarios = total - admins;

        return {
            total,
            ativos,
            inativos,
            admins,
            usuarios,
            ultimaAtualizacao: new Date().toLocaleString('pt-BR')
        };
    }
}

// Instância global do gerenciador de banco
const dbManager = new DatabaseManager();

// Exporta para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}
