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

const hosptais = [ 
     <!--HOSP.ITAU-->
                <option value="">Selecione um hospital</option>
                <option value="500135088_500142858">HOPALIS-HOSPITAL PARTICULAR LISBOA</option>
                <option value="500142742_500142858">HOSPITAL CUF INFANTE SANTO, S.A.</option>
                <option value="500701768_500142858">FARCHEM-AJUDAS TEC.E EQUIP.HOSPITAL</option>
                <option value="501536272_500142858">HOSPITAL DE REYNALDO DOS SANTOS</option>
                <option value="503035416_500142858">HOSPITAL PROF.DR.FERNANDO FONSECA</option>
                <option value="504558196_500142858">HOSPITAL DAS DESCOBERTAS, S.A.</option>
                <option value="504928716_500142858">HOSPITAL DA TROFA,S.A.</option>
                <option value="505197685_500142858">CENTRO HOSPITALAR</option>
                <option value="505201380_500142858">CENTRO HOSPITALAR DE CASCAIS</option>
                <option value="506361462_500142858">HOSPITAL DISTRITAL SANTARÉM, EPE</option>
                <option value="506361470_500142858">HOSPITAL GARCIA DE ORTA E.P.E.</option>
                <option value="506361489_500142858">HOSPITAL DE EGAS MONIZ, SA.</option>
                <option value="506361543_500142858">HOSPITAL INFANTE D. PEDRO,S.A.</option>
                <option value="506361608_500142858">CENTRO HOSPITALAR DO MÉDIO TEJO,SA.</option>
                <option value="506505537_500142858">HOSPITAL DA MISERCÓRDIA PAREDES,S.A</option>
                <option value="507606787_500142858">CENTRO HOSPITALAR DE SETUBAL E.P.E.</option>
                <option value="507924630_500142858">HOSPITAL PRIVADO BOA NOVA S.A.</option>
                <option value="508053960_500142858">HOSPITAL TERRA QUENTE,SA</option>
                <option value="508085888_500142858">HOSPITAL ESPÍRITO SANTO E.P.E.</option>
                <option value="508093937_500142858">CENTRO HOSPITALAR MÉDIO AVE. EPE</option>
                <option value="508142156_500142858">CENTRO HOSPITALAR DE VILA NOVA DE G</option>
                <option value="508331471_500142858">CENTRO HOSPITALAR DO PORTO, EPE</option>
                <option value="508338476_500142858">CENTRO HOSPITALAR PSIQUIATRICO</option>
                <option value="508481287_500142858">CENTRO HOSPITALAR LISBOA NORTE, EPE</option>
                <option value="508718872_500142858">HOSPITAL DE FARO, E.P.E.</option>
                <option value="508963150_500142858">HOSPITAL CUF PORTO, S.A.</option>
                <option value="509217605_500142858">SGHL-SOC.GESTORA HOSPITAL LOURES</option>
                <option value="509463371_500142858">ASSOC.PORTUG.HOTELARIA HOSPITALAR</option>
                <option value="509822932_500142858">CENTRO HOSPITALAR LEIRIA-POMBAL</option>
                <option value="509822940_500142858">CENTRO HOSPITALAR TONDELA-VISEU EPE</option>
                <option value="510113516_500142858">HOSPITAL DA LUZ COIMBRA, S.A</option>
                <option value="510412009_500142858">CENTRO HOSPITAL DO OESTE</option>
                <option value="510745997_500142858">CENTRO HOSPITALAR DO ALGARVE, EPE</option>
                <option value="511166354_500142858">CLINICA HOSPITALAR DA MADEIRA</option>
                <option value="514993871_500142858">CENTRO HOSPITALAR DO OESTE</option>
                <option value="515330086_500142858">YOUNAN HOSPITALITY PORTUGAL, UNIP.</option>
                <option value="515545180_500142858">HOSPITAL DE BRAGA, EPE</option>
                <option value="600027341_500142858">HOSPITAL DONA ESTEFANIA</option>
                
                <!--HOSP. IBERLIM-->
                <option value="503035416_502117281">HOSPITAL PROF.DR.FERNANDO FONSECA</option>
                <option value="504188755_502117281">SGH-SOC-GESTÃO HOSPITALAR, S.A.</option>
                <option value="505197685_502117281">CENTRO HOSPITALAR</option>
                <option value="506361470_502117281">HOSPITAL GARCIA DE ORTA E.P.E.</option>
                <option value="507606787_502117281">CENTRO HOSPITALAR DE SETUBAL E.P.E.</option>
                <option value="508085888_502117281">HOSPITAL ESPÍRITO SANTO E.P.E.</option>
                <option value="508142156_502117281">CENTRO HOSPITALAR DE VILA NOVA DE G</ <option <option
                <option value="508481287_502117281">CENTRO HOSPITALAR LISBOA NORTE, EPE</option>
                <option value="508718872_502117281">HOSPITAL DE FARO, E.P.E.</option>
                <option value="508820030_502117281">HOSPITAL DE BRAGA</option>
                <option value="509217605_502117281">SGHL-SOC.GESTORA HOSPITAL LOURES</option>
                <option value="509822932_502117281">CENTRO HOSPITALAR LEIRIA-POMBAL</option>
                <option value="509822940_502117281">CENTRO HOSPITALAR TONDELA-VISEU EPE</option>
                <option value="510103448_502117281">CENTRO HOSPITALAR UNIV.COIMBRA EPE</option>
                <option value="510745997_502117281">CENTRO HOSPITALAR DO ALGARVE, EPE</option>
                <option value="514362472_502117281">HOSPITAL INTERNACIONAL DOS AÇORES</option>
                <option value="514993871_502117281">CENTRO HOSPITALAR DO OESTE</option>
                <option value="515330086_502117281">YOUNAN HOSPITALITY PORTUGAL, UNIP.</option>
               
                <!--HOSP.SINAL-MAIS-->
                <option value="500766800_507166620">CLINICA CAMPO GRANDE-HOSPITAL ST LO</option>
                <option value="503035416_507166620">HOSPITAL PROF.DR.FERNANDO FONSECA</option>
                <option value="505197685_507166620">CENTRO HOSPITALAR</option>
                <option value="508053960_507166620">HOSPITAL TERRA QUENTE, SA</option>
                <option value="508142156_507166620">CENTRO HOSPITALAR DE VILA NOVA DE G</option>
                <option value="508481287_507166620">CENTRO HOSPITALAR LISBOA NORTE, EPE</option>
                <option value="508718872_507166620">HOSPITAL DE FARO, E.P.E.</option>
                <option value="509217605_507166620">SGHL-SOC.GESTORA HOSPITAL LOURES</option>
                <option value="509463371_507166620">ASSOC.PORTUG.HOTELARIA HOSPITALAR</option>
                <option value="513400869_507166620">HOSPITAL CUF VISEU, SA</option>
                <option value="515330086_507166620">YOUNAN HOSPITALITY PORTUGAL, UNIP.</option>
                <option value="515352381_507166620">HOSPITAL PRIVADO DE CHAVES, S.A.</option>
                <option value="515673641_507166620">HB - HOSPITAL DE BRAGANÇA</option>
                <option value="516487493_507166620">HOSPITAL DE VILA FRANCA DE XIRA EPE</option>
                
                <!--HOSP.STRONG CHARON-->
                <option value="500989001_503257567">IRMÃS HOSPITALEIRAS</option>
                <option value="503035416_503257567">HOSPITAL PROF.DR.FERNANDO FONSECA</option>
                <option value="504188755_503257567">SGH-SOC-GESTÃO HOSPITALAR, S.A.</option>
                <option value="504464736_503257567">PORTELA - EQUIPAMENTO HOSPITALAR E</option>
                <option value="505197685_503257567">CENTRO HOSPITALAR</option>
                <option value="508085888_503257567">HOSPITAL ESPÍRITO SANTO E.P.E.</option>
                <option value="508318262_503257567">CENTRO HOSPITALAR TAMEGA SOUSA EPE</option>
                <option value="508718872_503257567">HOSPITAL DE FARO, E.P.E.</option>
                <option value="509217605_503257567">SGHL-SOC.GESTORA HOSPITAL LOURES</option>
                <option value="509821197_503257567">CENTRO HOSPITALAR SÃO JOÃO, EPE</option>
                <option value="509822932_503257567">CENTRO HOSPITALAR LEIRIA-POMBAL</option>
                <option value="515330086_503257567">YOUNAN HOSPITALITY PORTUGAL, UNIP.</option>
                
                <!--HOSP. TRIVALOR-->
                <option value="504872982_502145820">HOSPITAL CUF DESCOBERTAS</option>
                <option value="505197685_502145820">CENTRO HOSPITALAR</option>
                <option value="508718872_502145820">HOSPITAL DE FARO, E.P.E.</option>
                <option value="509217605_502145820">SGHL-SOC.GESTORA HOSPITAL LOURES</option>
                <option value="515330086_502145820">YOUNAN HOSPITALITY PORTUGAL, UNIP.</option>



// Função para abrir o modal e preencher a lista de hospitais
        function hospitais() {
            const hospitalSelect = document.getElementById('hospital_select');
            hospitalSelect.innerHTML = '<option value="">Selecione um hospital</option>'; // Limpa as opções existentes

            hospitals.forEach(hospital => {
                const option = document.createElement('option');
                option.value = hospital.value;
                option.textContent = hospital.text;
                hospitalSelect.appendChild(option);
            });

            // Exibe o modal
            const modal = document.getElementById("hospitalModal");
            modal.style.display = "block";
        }

        // Função para fechar o modal
        const span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            const modal = document.getElementById("hospitalModal");
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            const modal = document.getElementById("hospitalModal");
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        function fillHospitalData() {
            const selectedHospital = document.getElementById('hospital_select').value;
            if (selectedHospital) {
                console.log("Hospital selecionado:", selectedHospital);
            }
        }
    </script>
