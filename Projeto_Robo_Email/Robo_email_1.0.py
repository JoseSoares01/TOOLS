import imaplib
import email
from email.header import decode_header
import os
import zipfile
import openpyxl
import pandas as pd
import PySimpleGUI as sg

# Função para fazer download dos anexos
def download_attachments(email_user, email_pass, download_folder):
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(email_user, email_pass)
    mail.select("inbox")

    status, messages = mail.search(None, 'ALL')
    email_ids = messages[0].split()

    for e_id in email_ids:
        res, msg = mail.fetch(e_id, "(RFC822)")
        for response in msg:
            if isinstance(response, tuple):
                msg = email.message_from_bytes(response[1])
                subject = decode_header(msg["Subject"])[0][0]
                if isinstance(subject, bytes):
                    subject = subject.decode()
                print("Subject:", subject)
                
                if msg.is_multipart():
                    for part in msg.walk():
                        content_disposition = str(part.get("Content-Disposition"))
                        if "attachment" in content_disposition:
                            filename = part.get_filename()
                            if filename:
                                filepath = os.path.join(download_folder, filename)
                                with open(filepath, "wb") as f:
                                    f.write(part.get_payload(decode=True))
                                print(f"Downloaded {filename}")
    mail.logout()

# Função para extrair dados de arquivos XLSX
def extract_data_from_excel(folder_path):
    data = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".xlsx"):
            file_path = os.path.join(folder_path, filename)
            wb = openpyxl.load_workbook(file_path)
            ws = wb.active
            for row in ws.iter_rows(min_row=2, values_only=True):  # Ajuste conforme necessário
                data.append({
                    "Data": row[0],
                    "Entrada": row[1],
                    "Contabilizadas": row[2],
                    "Submetidas em PS": row[3],
                    "Erro": row[4]
                })
    return data

# Função para salvar dados extraídos em um novo arquivo XLSX
def save_to_excel(data, output_path):
    df = pd.DataFrame(data)
    df.to_excel(output_path, index=False)
    print(f"Dados salvos em {output_path}")

# Tema da Interface Gráfica
sg.theme("DarkTeal12")

# Layout da Interface Gráfica
layout = [
    [sg.Text("Email"), sg.Input(key="email")],
    [sg.Text("Senha"), sg.Input(key="senha", password_char="*")],
    [sg.FolderBrowse("Escolher Pasta de Download", target="download_folder"), sg.Input(key="download_folder")],
    [sg.FolderBrowse("Escolher Pasta Planilha", target="input_planilha"), sg.Input(key="input_planilha")],
    [sg.Button("Salvar")]
]

window = sg.Window("principal", layout)

# Loop para não fechar o sistema automaticamente
while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED:
        break
    if event == "Salvar":
        email_user = values["email"]
        email_pass = values["senha"]
        download_folder = values["download_folder"]
        output_folder = values["input_planilha"]
        
        # Fazendo download dos anexos
        download_attachments(email_user, email_pass, download_folder)
        
        # Extraindo dados dos arquivos XLSX
        extracted_data = extract_data_from_excel(download_folder)
        
        # Salvando dados extraídos em uma nova planilha
        output_path = os.path.join(output_folder, "dados_extraidos.xlsx")
        save_to_excel(extracted_data, output_path)

window.close()
