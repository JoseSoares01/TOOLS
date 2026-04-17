/**
 * Trivalor — pesquisa de fornecedores estrangeiros a partir do XML Excel (SpreadsheetML).
 *
 * Ficheiro esperado: /data/faturas_strong_sqr.xml (cópia do Excel exportado).
 * Colunas reais no XML (linha 1 = cabeçalho):
 *   - NIF Fornecedor  → nif_vendedor
 *   - Nome fornecedor → pesquisa + exibição
 *   - NIF empresa     → nif_empresa
 *   - Zona            → espaco_fiscal e pais (mesma lógica que ModalHospital.applySelection: valor único para ambos)
 *
 * Não existem no XML: tipologia, país explícito. Tipologia FT é aplicada aqui conforme pedido de negócio
 * para faturas típicas; país/espaco derivam só da coluna Zona (EU, INT, PT, …).
 * Base isenta: este módulo NUNCA altera #base_isenta.
 *
 * Deduplicação: uma entrada por NIF fornecedor + Zona (normalizados); o Excel repete muitas linhas iguais.
 *
 * Atualização do ficheiro XML: substitua /data/faturas_strong_sqr.xml no servidor.
 * - Pedidos com cache: 'no-store' para o browser não ficar com XML antigo.
 * - Ao voltar ao separador (visibilitychange), a lista recarrega do servidor (novas empresas/NIFs).
 * - API manual: window.TrivalorForeignVendorXml.reload() (ex.: após deploy ou teste).
 */
(function () {
    "use strict";

    /**
     * Caminho do XML no site. Para usar outro nome, altere só esta constante
     * ou chame TrivalorForeignVendorXml.setXmlUrl('/data/outro.xml') antes do DOMContentLoaded
     * (ou defina window.TRIVALOR_VENDOR_XML_URL).
     */
    var XML_URL =
        typeof window.TRIVALOR_VENDOR_XML_URL === "string" && window.TRIVALOR_VENDOR_XML_URL
            ? window.TRIVALOR_VENDOR_XML_URL
            : "/data/faturas_strong_sqr.xml";

    var SS_NS = "urn:schemas-microsoft-com:office:spreadsheet";
    var MIN_QUERY_LEN = 2;
    var MAX_SUGGESTIONS = 16;
    var DEBOUNCE_MS = 200;
    var VISIBILITY_RELOAD_MS = 600;

    /** Cache em memória da sessão; é limpo em reload forçado ou ao voltar ao separador. */
    var records = null;
    var debounceTimer = null;
    var visibilityTimer = null;
    /** Referência à UI após init (para atualizar mensagens após reload). */
    var uiRef = null;
    var lifecycleHooksInstalled = false;
    /** Só recarrega XML ao voltar de outro separador (evita pedido duplicado na abertura). */
    var tabWasHiddenOnce = false;

    function normalizeSearch(s) {
        if (!s) return "";
        return String(s)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    /** Remove espaços internos para comparar NIFs (evita duplicados por formatação). */
    function normNif(s) {
        return String(s || "")
            .replace(/\s+/g, "")
            .toUpperCase();
    }

    function normZona(z) {
        return String(z || "").trim().toUpperCase();
    }

    /**
     * Mapeia a coluna "Zona" do XML para os valores dos selects existentes.
     * Valores não reconhecidos: INT (internacional), alinhado ao uso de INT em ModalHospital.
     */
    function zonaToPaisEspacoFiscal(zonaRaw) {
        var z = (zonaRaw || "").trim().toUpperCase();
        if (z === "EU" || z === "PT" || z === "INT") {
            return { pais: z, espaco: z };
        }
        if (z === "PT-AC" || z === "PT-MA") {
            return { pais: "PT", espaco: z };
        }
        if (z) {
            console.warn("[Trivalor XML fornecedores] Zona desconhecida no XML, a usar INT:", z);
        }
        return { pais: "INT", espaco: "INT" };
    }

    function getCellText(cell) {
        var dataList = cell.getElementsByTagNameNS(SS_NS, "Data");
        if (!dataList.length) return "";
        var t = dataList[0].textContent;
        return t != null ? String(t).trim() : "";
    }

    function parseSpreadsheetXml(xmlText) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlText, "text/xml");
        var parseErr = doc.querySelector("parsererror");
        if (parseErr) {
            throw new Error("XML inválido: " + (parseErr.textContent || "parsererror"));
        }
        var rows = doc.getElementsByTagNameNS(SS_NS, "Row");
        if (!rows || rows.length < 2) {
            return [];
        }

        var out = [];
        var seen = Object.create(null);

        for (var r = 1; r < rows.length; r++) {
            var row = rows[r];
            var cells = row.getElementsByTagNameNS(SS_NS, "Cell");
            var texts = [];
            for (var c = 0; c < cells.length; c++) {
                texts.push(getCellText(cells[c]));
            }
            while (texts.length < 4) {
                texts.push("");
            }

            var nifFornecedor = (texts[0] || "").trim();
            var nome = (texts[1] || "").trim();
            var nifEmpresa = (texts[2] || "").trim();
            var zona = (texts[3] || "").trim();

            if (!nome && !nifFornecedor) {
                continue;
            }

            /**
             * Uma linha única por (NIF fornecedor + zona): o XML repete a mesma fatura/fornecedor
             * centenas de vezes; NIF empresa costuma ser o mesmo. Ignora repetidos adicionais.
             * Se no futuro o mesmo NIF+zona tiver NIF empresa distintos, mantém-se o primeiro visto.
             */
            var dedupeKey = normNif(nifFornecedor) + "|" + normZona(zona);
            if (!normNif(nifFornecedor)) {
                dedupeKey = "NONIF|" + normalizeSearch(nome) + "|" + normZona(zona);
            }
            if (seen[dedupeKey]) {
                continue;
            }
            seen[dedupeKey] = true;

            out.push({
                nifFornecedor: nifFornecedor,
                nome: nome,
                nifEmpresa: nifEmpresa,
                zona: zona,
                _searchKey: normalizeSearch(nome + " " + nifFornecedor + " " + nifEmpresa),
            });
        }

        return out;
    }

    /**
     * @param {function(Array|null, Error|null)} done
     * @param {{ force?: boolean }} [opts] force=true ignora cache em memória e pede ficheiro novo ao servidor
     */
    function fetchRecords(done, opts) {
        opts = opts || {};
        if (records !== null && !opts.force) {
            done(records, null);
            return;
        }

        if (opts.force) {
            records = null;
        }

        var sep = XML_URL.indexOf("?") >= 0 ? "&" : "?";
        var url = opts.force ? XML_URL + sep + "_=" + Date.now() : XML_URL;

        fetch(url, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
        })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error("HTTP " + res.status + " ao carregar " + XML_URL);
                }
                return res.text();
            })
            .then(function (text) {
                try {
                    records = parseSpreadsheetXml(text);
                    console.log(
                        "[Trivalor XML fornecedores] Registos únicos carregados" +
                            (opts.force ? " (atualizado)" : "") +
                            ":",
                        records.length
                    );
                    done(records, null);
                } catch (parseEx) {
                    records = null;
                    console.error("[Trivalor XML fornecedores] Erro ao interpretar o XML:", parseEx);
                    done(null, parseEx);
                }
            })
            .catch(function (err) {
                records = null;
                console.error("[Trivalor XML fornecedores] Falha ao carregar ou processar o XML:", err);
                done(null, err);
            });
    }


    /** Remove cache em memória e volta a pedir o XML (identifica novas linhas/NIFs após substituir o ficheiro). */
    function reloadVendorXmlFromServer(callback) {
        records = null;
        fetchRecords(
            function (data, err) {
                if (typeof callback === "function") {
                    callback(data, err);
                }
                if (uiRef) {
                    if (err) {
                        setStatus(uiRef.statusEl, "Erro ao atualizar a lista (ver consola).", true);
                    } else {
                        var n = data ? data.length : 0;
                        setStatus(uiRef.statusEl, "Lista atualizada (" + n + " fornecedores únicos).", false);
                        if (normalizeSearch(uiRef.input.value).length >= MIN_QUERY_LEN) {
                            runSearch(uiRef.input, uiRef.listEl, uiRef.statusEl);
                        }
                    }
                }
            },
            { force: true }
        );
    }

    function scheduleReloadOnVisible() {
        if (document.visibilityState !== "visible") {
            return;
        }
        if (!tabWasHiddenOnce) {
            return;
        }
        clearTimeout(visibilityTimer);
        visibilityTimer = setTimeout(function () {
            reloadVendorXmlFromServer();
        }, VISIBILITY_RELOAD_MS);
    }

    function applyRecordToForm(rec) {
        var nifV = document.getElementById("nif_vendedor");
        var nifE = document.getElementById("nif_empresa");
        var pais = document.getElementById("pais");
        var espaco = document.getElementById("espaco_fiscal");
        var tipo = document.getElementById("tipologia");

        if (!nifV || !nifE || !pais || !espaco || !tipo) {
            console.error("[Trivalor XML fornecedores] Campos do formulário em falta.");
            return;
        }

        try {
            nifV.value = rec.nifFornecedor || "";
            nifE.value = rec.nifEmpresa || "";
            var map = zonaToPaisEspacoFiscal(rec.zona);
            pais.value = map.pais;
            espaco.value = map.espaco;
            tipo.value = "FT";
        } catch (e) {
            console.error("[Trivalor XML fornecedores] Erro ao preencher:", e);
            return;
        }

        if (typeof window.updateIVARates === "function") {
            window.updateIVARates();
        }
        if (typeof window.updateTaxBaseFieldsVisibility === "function") {
            window.updateTaxBaseFieldsVisibility();
        }
        pais.dispatchEvent(new Event("change", { bubbles: true }));
        espaco.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function renderSuggestions(container, items, onPick) {
        container.innerHTML = "";
        container.hidden = items.length === 0;

        for (var i = 0; i < items.length; i++) {
            (function (rec) {
                var btn = document.createElement("button");
                btn.type = "button";
                btn.className = "foreign-vendor-xml__item";
                var label = (rec.nome || "(sem nome)") + " — " + (rec.nifFornecedor || "?");
                if (rec.zona) {
                    label += " [" + rec.zona + "]";
                }
                btn.textContent = label;
                btn.addEventListener("click", function () {
                    onPick(rec);
                });
                container.appendChild(btn);
            })(items[i]);
        }
    }

    function setStatus(el, text, isError) {
        if (!el) return;
        el.textContent = text || "";
        el.classList.toggle("foreign-vendor-xml__status--error", !!isError);
    }

    function runSearch(input, listEl, statusEl) {
        var q = normalizeSearch(input.value);
        if (q.length < MIN_QUERY_LEN) {
            listEl.innerHTML = "";
            listEl.hidden = true;
            setStatus(statusEl, "", false);
            return;
        }

        fetchRecords(function (data, err) {
            if (err) {
                setStatus(statusEl, "Não foi possível carregar a lista de fornecedores.", true);
                listEl.hidden = true;
                return;
            }

            var matches = [];
            for (var i = 0; i < data.length && matches.length < MAX_SUGGESTIONS; i++) {
                if (data[i]._searchKey.indexOf(q) !== -1) {
                    matches.push(data[i]);
                }
            }

            if (!matches.length) {
                listEl.innerHTML = "";
                listEl.hidden = true;
                setStatus(statusEl, "Nenhum resultado para esta pesquisa.", false);
                return;
            }

            setStatus(statusEl, matches.length + " sugestão(ões). Clique para preencher.", false);
            renderSuggestions(listEl, matches, function (rec) {
                applyRecordToForm(rec);
                input.value = "";
                listEl.innerHTML = "";
                listEl.hidden = true;
                setStatus(statusEl, "Dados aplicados (tipologia FT). Ajuste a base isenta se necessário.", false);
            });
        });
    }

    function init() {
        var root = document.getElementById("foreignVendorXmlBlock");
        if (!root) {
            return;
        }

        var input = document.getElementById("foreignVendorXmlSearch");
        var listEl = document.getElementById("foreignVendorXmlSuggestions");
        var statusEl = document.getElementById("foreignVendorXmlStatus");

        if (!input || !listEl || !statusEl) {
            console.error("[Trivalor XML fornecedores] Markup incompleto (ids em falta).");
            return;
        }

        uiRef = { input: input, listEl: listEl, statusEl: statusEl };

        input.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                runSearch(input, listEl, statusEl);
            }, DEBOUNCE_MS);
        });

        input.addEventListener("focus", function () {
            if (normalizeSearch(input.value).length >= MIN_QUERY_LEN) {
                runSearch(input, listEl, statusEl);
            }
        });

        document.addEventListener("click", function (e) {
            if (!root.contains(e.target)) {
                listEl.hidden = true;
            }
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                listEl.hidden = true;
            }
        });

        fetchRecords(function (_data, err) {
            if (err) {
                setStatus(statusEl, "Lista indisponível (ver consola).", true);
            } else {
                setStatus(statusEl, "Lista carregada. Escreva o nome do fornecedor.", false);
            }
        });

        if (!lifecycleHooksInstalled) {
            lifecycleHooksInstalled = true;
            document.addEventListener("visibilitychange", function () {
                if (document.visibilityState === "hidden") {
                    tabWasHiddenOnce = true;
                    return;
                }
                scheduleReloadOnVisible();
            });
            window.addEventListener("pageshow", function (ev) {
                if (ev.persisted && uiRef) {
                    reloadVendorXmlFromServer();
                }
            });
        }

        window.TrivalorForeignVendorXml = {
            /** Força novo download do XML e reprocessamento (novas empresas/NIFs). */
            reload: function (callback) {
                reloadVendorXmlFromServer(callback);
            },
            /** Altera o caminho do ficheiro e recarrega (ex.: outro nome em /data/). */
            setXmlUrl: function (url) {
                if (typeof url !== "string" || !url.trim()) {
                    return;
                }
                XML_URL = url.trim();
                reloadVendorXmlFromServer();
            },
            getXmlUrl: function () {
                return XML_URL;
            },
            getRecordCount: function () {
                return records ? records.length : 0;
            },
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
