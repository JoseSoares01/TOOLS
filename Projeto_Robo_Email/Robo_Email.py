#Bibliotecas
import PySimpleGUI as sg
import pandas as pd

#Tema da Interface Grafica
sg.theme("DarkTeal12")

#Layout da Interface Grafica
layout = [
    [sg.Text("Email"), sg.Input(key="email")],
    [sg.Text("Senha"), sg.Input(key="senha", password_char="*")],
    [sg.FolderBrowse("Escolher Pasta Anexos", target="input_anexos"), sg.Input(key="input_anexos")],
    [sg.FolderBrowse("Escolher Pasta Planilha", target="input_planilha"), sg.Input(key="input_planilha")],
    [sg.Button("Salvar")]
]

window = sg.Window("principal", layout)

#Loop para não fechar o sistema automaticamente
while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED:
        break
    if event == "Salvar":
        email = values["email"]
        senha = values["senha"]
        caminho_pasta_anexos = values["input_anexos"]
        caminho_pasta_planilha = values["input_planilha"]
        
        # Imprimindo os dados coletados (para fins de depuração)
        print(f"Email: {email}")
        print(f"Senha: {senha}")
        print(f"Caminho da pasta de anexos: {caminho_pasta_anexos}")
        print(f"Caminho da pasta de planilha: {caminho_pasta_planilha}")
        
        # Salvar os dados coletados em um arquivo Excel
        dados = {
            "Email": [email],
            "Senha": [senha],
            "Caminho da Pasta de Anexos": [caminho_pasta_anexos],
            "Caminho da Pasta de Planilha": [caminho_pasta_planilha]
        }
        
        df = pd.DataFrame(dados)
        df.to_excel('dados_formulario.xlsx', index=False)
        print('Dados salvos em dados_formulario.xlsx')

window.close()