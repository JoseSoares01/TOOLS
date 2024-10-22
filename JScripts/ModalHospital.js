// Função para preencher os campos de NIF com base na seleção do hospital
function fillHospitalData() {
    const selectedValue = document.getElementById('hospital_select').value;
    const [nifVendedor, nifEmpresa] = selectedValue.split('_');
    document.getElementById('nif_vendedor').value = nifVendedor || '';
    document.getElementById('nif_empresa').value = nifEmpresa || '';
}

// Função para abrir o modal
var modal = document.getElementById("hospitalModal");
var btn = document.getElementById("openModalBtn");
var span = document.getElementsByClassName("close")[0];

// Abrir modal ao clicar no botão
btn.onclick = function() {
    modal.style.display = "block";
}

// Fechar modal ao clicar no "X"
span.onclick = function() {
    modal.style.display = "none";
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//HOSP.ITAU-->
const hospitais = [
    { value: "", label: "Selecione um hospital" },
    { value: "500135088_500142858", label: "HOPALIS-HOSPITAL PARTICULAR LISBOA" },
    { value: "500142742_500142858", label: "HOSPITAL CUF INFANTE SANTO, S.A." },
    { value: "500701768_500142858", label: "FARCHEM-AJUDAS TEC.E EQUIP.HOSPITAL" },
    { value: "501536272_500142858", label: "HOSPITAL DE REYNALDO DOS SANTOS" },
    { value: "503035416_500142858", label: "HOSPITAL PROF.DR.FERNANDO FONSECA" },
    { value: "504558196_500142858", label: "HOSPITAL DAS DESCOBERTAS, S.A." },
    { value: "504928716_500142858", label: "HOSPITAL DA TROFA,S.A." },
    { value: "505197685_500142858", label: "CENTRO HOSPITALAR" },
    { value: "505201380_500142858", label: "CENTRO HOSPITALAR DE CASCAIS" },
    { value: "506361462_500142858", label: "HOSPITAL DISTRITAL SANTARÉM, EPE" },
    { value: "506361470_500142858", label: "HOSPITAL GARCIA DE ORTA E.P.E." },
    { value: "506361489_500142858", label: "HOSPITAL DE EGAS MONIZ, SA." },
    { value: "506361543_500142858", label: "HOSPITAL INFANTE D. PEDRO,S.A." },
    { value: "506361608_500142858", label: "CENTRO HOSPITALAR DO MÉDIO TEJO,SA." },
    { value: "506505537_500142858", label: "HOSPITAL DA MISERCÓRDIA PAREDES,S.A" },
    { value: "507606787_500142858", label: "CENTRO HOSPITALAR DE SETUBAL E.P.E." },
    { value: "507924630_500142858", label: "HOSPITAL PRIVADO BOA NOVA S.A." },
    { value: "508053960_500142858", label: "HOSPITAL TERRA QUENTE,SA" },
    { value: "508085888_500142858", label: "HOSPITAL ESPÍRITO SANTO E.P.E." },
    { value: "508093937_500142858", label: "CENTRO HOSPITALAR MÉDIO AVE. EPE" },
    { value: "508142156_500142858", label: "CENTRO HOSPITALAR DE VILA NOVA DE G" },
    { value: "508331471_500142858", label: "CENTRO HOSPITALAR DO PORTO, EPE" },
    { value: "508338476_500142858", label: "CENTRO HOSPITALAR PSIQUIATRICO" },
    { value: "508481287_500142858", label: "CENTRO HOSPITALAR LISBOA NORTE, EPE" },
    { value: "508718872_500142858", label: "HOSPITAL DE FARO, E.P.E." },
    { value: "508963150_500142858", label: "HOSPITAL CUF PORTO, S.A." },
    { value: "509217605_500142858", label: "SGHL-SOC.GESTORA HOSPITAL LOURES" },
    { value: "509463371_500142858", label: "ASSOC.PORTUG.HOTELARIA HOSPITALAR" },
    { value: "509822932_500142858", label: "CENTRO HOSPITALAR LEIRIA-POMBAL" },
    { value: "509822940_500142858", label: "CENTRO HOSPITALAR TONDELA-VISEU EPE" },
    { value: "510113516_500142858", label: "HOSPITAL DA LUZ COIMBRA, S.A" },
    { value: "510412009_500142858", label: "CENTRO HOSPITAL DO OESTE" },
    { value: "510745997_500142858", label: "CENTRO HOSPITALAR DO ALGARVE, EPE" },
    { value: "511166354_500142858", label: "CLINICA HOSPITALAR DA MADEIRA" },
    { value: "514993871_500142858", label: "CENTRO HOSPITALAR DO OESTE" },
    { value: "515330086_500142858", label: "YOUNAN HOSPITALITY PORTUGAL, UNIP." },
    { value: "515545180_500142858", label: "HOSPITAL DE BRAGA, EPE" },
    { value: "600027341_500142858", label: "HOSPITAL DONA ESTEFANIA" },

    // HOSP. IBERLIM
    { value: "503035416_502117281", label: "HOSPITAL PROF.DR.FERNANDO FONSECA" },
    { value: "504188755_502117281", label: "SGH-SOC-GESTÃO HOSPITALAR, S.A." },
    { value: "505197685_502117281", label: "CENTRO HOSPITALAR" },
    { value: "506361470_502117281", label: "HOSPITAL GARCIA DE ORTA E.P.E." },
    { value: "507606787_502117281", label: "CENTRO HOSPITALAR DE SETUBAL E.P.E." },
    { value: "508085888_502117281", label: "HOSPITAL ESPÍRITO SANTO E.P.E." },
    { value: "508142156_502117281", label: "CENTRO HOSPITALAR DE VILA NOVA DE G" },
    { value: "508481287_502117281", label: "CENTRO HOSPITALAR LISBOA NORTE, EPE" },
    { value: "508718872_502117281", label: "HOSPITAL DE FARO, E.P.E." },
    { value: "508820030_502117281", label: "HOSPITAL DE BRAGA" },
    { value: "509217605_502117281", label: "SGHL-SOC.GESTORA HOSPITAL LOURES" },
    { value: "509822932_502117281", label: "CENTRO HOSPITALAR LEIRIA-POMBAL" },
    { value: "509822940_502117281", label: "CENTRO HOSPITALAR TONDELA-VISEU EPE" },
    { value: "510103448_502117281", label: "CENTRO HOSPITALAR UNIV.COIMBRA EPE" },
    { value: "510745997_502117281", label: "CENTRO HOSPITALAR DO ALGARVE, EPE" },
    { value: "514362472_502117281", label: "HOSPITAL INTERNACIONAL DOS AÇORES" },
    { value: "514993871_502117281", label: "CENTRO HOSPITALAR DO OESTE" },
    { value: "515330086_502117281", label: "YOUNAN HOSPITALITY PORTUGAL, UNIP." },

    // HOSP. SINAL-MAIS
    { value: "500766800_507166620", label: "CLINICA CAMPO GRANDE-HOSPITAL ST LO" },
    { value: "503035416_507166620", label: "HOSPITAL PROF.DR.FERNANDO FONSECA" },
    { value: "505197685_507166620", label: "CENTRO HOSPITALAR" },
    { value: "508053960_507166620", label: "HOSPITAL TERRA QUENTE, SA" },
    { value: "508142156_507166620", label: "CENTRO HOSPITALAR DE VILA NOVA DE G" },
    { value: "508481287_507166620", label: "CENTRO HOSPITALAR LISBOA NORTE, EPE" },
    { value: "508718872_507166620", label: "HOSPITAL DE FARO, E.P.E." },
    { value: "509217605_507166620", label: "SGHL-SOC.GESTORA HOSPITAL LOURES" },
    { value: "509463371_507166620", label: "ASSOC.PORTUG.HOTELARIA HOSPITALAR" },
    { value: "513400869_507166620", label: "HOSPITAL CUF VISEU, SA" },
    { value: "515330086_507166620", label: "YOUNAN HOSPITALITY PORTUGAL, UNIP." },
    { value: "515352381_507166620", label: "HOSPITAL PRIVADO DE CHAVES,SA" },
    { value: "516487493_507166620", label: "HOSPITAL DE VILA FRANCA DE XIRA EPE" },
    { value: "515673641_507166620", label: "HOSPITAL DE BRAGANÇA" },

    // HOSP. STRONG CHARON
    { value: "500989001_503257567", label: "IRMÃS HOSPITALEIRAS" },
    { value: "503035416_503257567", label: "HOSPITAL PROF.DR.FERNANDO FONSECA" },
    { value: "504188755_503257567", label: "SGH-SOC-GESTÃO HOSPITALAR, S.A." },
    { value: "504464736_503257567", label: "PORTELA - EQUIPAMENTO HOSPITALAR E" },
    { value: "505197685_503257567", label: "CENTRO HOSPITALAR" },
    { value: "508085888_503257567", label: "HOSPITAL ESPÍRITO SANTO E.P.E." },
    { value: "508318262_503257567", label: "CENTRO HOSPITALAR TAMEGA SOUSA EPE" },
    { value: "508718872_503257567", label: "HOSPITAL DE FARO, E.P.E." },
    { value: "509217605_503257567", label: "SGHL-SOC.GESTORA HOSPITAL LOURES" },
    { value: "509821197_503257567", label: "CENTRO HOSPITALAR SÃO JOÃO, EPE" },
    { value: "509822932_503257567", label: "CENTRO HOSPITALAR LEIRIA-POMBAL" },
    { value: "515330086_503257567", label: "YOUNAN HOSPITALITY PORTUGAL, UNIP." },

    // HOSP. TRIVALOR
    { value: "504872982_502145820", label: "HOSPITAL CUF DESCOBERTAS" },
    { value: "505197685_502145820", label: "CENTRO HOSPITALAR" },
    { value: "508718872_502145820", label: "HOSPITAL DE FARO, E.P.E." },
    { value: "509217605_502145820", label: "SGHL-SOC.GESTORA HOSPITAL LOURES" },
    { value: "515330086_502145820", label: "YOUNAN HOSPITALITY PORTUGAL, UNIP." },

];

// Função para abrir o modal
function openModal() {
    document.getElementById("hospitalModal").style.display = "block";
    populateHospitalList(); // Popula a lista de hospitais
}

// Função para fechar o modal
function closeModal() {
    document.getElementById("hospitalModal").style.display = "none";
}

// Função para preencher o select com os hospitais
function populateHospitalList() {
    var hospitalSelect = document.getElementById("hospital_select");
    var hospitals = [
        { value: "500989001_503257567", label: "IRMÃS HOSPITALEIRAS" },
        { value: "503035416_503257567", label: "HOSPITAL PROF.DR.FERNANDO FONSECA" },
        { value: "504188755_503257567", label: "SGH-SOC-GESTÃO HOSPITALAR, S.A." },
        // Continue adicionando hospitais aqui
    ];

    // Limpa o select antes de adicionar os novos hospitais
    hospitalSelect.innerHTML = "";

    hospitals.forEach(function(hospital) {
        var option = document.createElement("option");
        option.value = hospital.value;
        option.text = hospital.label;
        hospitalSelect.appendChild(option);
    });
}

// Função para capturar a seleção do hospital e preencher os dados do QR code (exemplo)
function fillHospitalData() {
    var selectedHospital = document.getElementById("hospital_select").value;
    document.getElementById("qr_data").value = selectedHospital;
}