// Dados iniciais das doações com mais variedade temporal
let donations = [
    // 2023
    { id: 1, data: '2023-09-12', tipo: 'Semestral', categoria: 'Roupas', responsavel: 'João Silva', valor: 150.00, origem: 'manual', timestamp: new Date('2023-09-12').getTime() },
    { id: 2, data: '2023-09-12', tipo: 'Semestral', categoria: 'Roupas', responsavel: 'Maria Santos', valor: 200.00, origem: 'manual', timestamp: new Date('2023-09-12').getTime() },
    { id: 3, data: '2023-09-12', tipo: 'Semestral', categoria: 'Roupas', responsavel: 'Pedro Costa', valor: 100.00, origem: 'manual', timestamp: new Date('2023-09-12').getTime() },
    { id: 4, data: '2023-10-15', tipo: 'Mensal', categoria: 'Alimentos', responsavel: 'Ana Costa', valor: 300.00, origem: 'externo', timestamp: new Date('2023-10-15').getTime() },
    { id: 5, data: '2023-11-20', tipo: 'Mensal', categoria: 'Medicamentos', responsavel: 'Carlos Silva', valor: 500.00, origem: 'manual', timestamp: new Date('2023-11-20').getTime() },
    { id: 6, data: '2023-12-01', tipo: 'Anual', categoria: 'Brinquedos', responsavel: 'Luiza Pereira', valor: 800.00, origem: 'manual', timestamp: new Date('2023-12-01').getTime() },
    // 2024
    { id: 7, data: '2024-01-10', tipo: 'Mensal', categoria: 'Livros', responsavel: 'Roberto Alves', valor: 250.00, origem: 'externo', timestamp: new Date('2024-01-10').getTime() },
    { id: 8, data: '2024-02-05', tipo: 'Mensal', categoria: 'Alimentos', responsavel: 'Fernanda Lima', valor: 320.00, origem: 'manual', timestamp: new Date('2024-02-05').getTime() },
    { id: 9, data: '2024-03-12', tipo: 'Semanal', categoria: 'Roupas', responsavel: 'Sistema Automático', valor: 150.00, origem: 'externo', timestamp: new Date('2024-03-12').getTime() },
    { id: 10, data: '2024-04-20', tipo: 'Mensal', categoria: 'Medicamentos', responsavel: 'Dr. Silva', valor: 450.00, origem: 'manual', timestamp: new Date('2024-04-20').getTime() },
    // 2025
    { id: 11, data: '2025-01-15', tipo: 'Anual', categoria: 'Geral', responsavel: 'Coordenação', valor: 1200.00, origem: 'manual', timestamp: new Date('2025-01-15').getTime() },
    { id: 12, data: '2025-08-10', tipo: 'Semanal', categoria: 'Alimentos', responsavel: 'Parceiro X', valor: 180.00, origem: 'externo', timestamp: new Date('2025-08-10').getTime() }
];

// Variáveis de controle
let currentPage = 1;
const itemsPerPage = 10;
let nextId = Math.max(...donations.map(d => d.id), 0) + 1;

// Cache para elementos do DOM
let elements = {};

// Função para obter elementos do DOM com cache
function getElement(id) {
    if (!elements[id]) {
        elements[id] = document.getElementById(id);
        if (!elements[id]) {
            console.warn(`Elemento com ID '${id}' não encontrado`);
        }
    }
    return elements[id];
}

// Funções utilitárias
const utils = {
    // Função aprimorada para formatar data no padrão brasileiro (dd/mm/yyyy)
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            // Garantir que a data seja formatada corretamente no padrão brasileiro
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return '';
        }
    },

    // Função para converter data do formato brasileiro (dd/mm/yyyy) para ISO (yyyy-mm-dd)
    parseBrazilianDate(dateString) {
        if (!dateString) return null;
        try {
            // Se já está no formato ISO, retornar como está
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            
            // Se está no formato brasileiro (dd/mm/yyyy), converter
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao converter data brasileira:', error);
            return null;
        }
    },

    // Função para obter data atual no formato brasileiro
    getCurrentDateBR() {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
    },

    // Função para obter data atual no formato ISO
    getCurrentDateISO() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    },
    
    formatCurrency(value) {
        try {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value || 0);
        } catch (error) {
            console.error('Erro ao formatar moeda:', error);
            return `R$ ${(value || 0).toFixed(2)}`;
        }
    },

    generateRandomValue(min = 50, max = 500) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getDateRange(type, referenceDate = new Date()) {
        const year = referenceDate.getFullYear();
        const month = referenceDate.getMonth();
        const day = referenceDate.getDate();

        switch(type) {
            case 'Anual':
                return {
                    start: new Date(year, 0, 1),
                    end: new Date(year, 11, 31)
                };
            case 'Mensal':
                return {
                    start: new Date(year, month, 1),
                    end: new Date(year, month + 1, 0)
                };
            case 'Semanal':
                const startOfWeek = new Date(referenceDate);
                startOfWeek.setDate(day - referenceDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return {
                    start: startOfWeek,
                    end: endOfWeek
                };
            default:
                return {
                    start: new Date(year, month, day),
                    end: new Date(year, month, day)
                };
        }
    },

    isDateInRange(date, range) {
        try {
            const checkDate = new Date(date);
            return checkDate >= range.start && checkDate <= range.end;
        } catch (error) {
            console.error('Erro ao verificar intervalo de datas:', error);
            return false;
        }
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Sistema de notificações aprimorado
const notification = {
    show(message, type = 'success', duration = 5000) {
        const toastContainer = getElement('toastContainer');
        if (!toastContainer) {
            console.warn('Toast container não encontrado');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast1 ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content1">
                <i class="toast-icon1 ${icons[type] || icons.info}"></i>
                <div class="toast-message1">${message}</div>
                <button class="toast-close1" type="button">&times;</button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Forçar reflow para animação
        toast.offsetHeight;
        setTimeout(() => toast.classList.add('show1'), 50);
        
        const removeToast = () => {
            toast.classList.remove('show1');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        };
        
        const timeoutId = setTimeout(removeToast, duration);
        
        const closeBtn = toast.querySelector('.toast-close1');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(timeoutId);
                removeToast();
            });
        }
    }
};

// Função para criar gráficos
function createChart(data, type = 'bar') {
    const hiddenChart = getElement('hiddenChart');
    if (!hiddenChart || !window.Chart) {
        console.warn('Chart.js não disponível ou canvas não encontrado');
        return null;
    }

    try {
        const ctx = hiddenChart.getContext('2d');
        
        // Destruir gráfico existente se houver
        if (window.currentChart) {
            window.currentChart.destroy();
        }
        
        // Preparar dados para o gráfico
        const categories = {};
        data.forEach(d => {
            const categoria = d.categoria || 'Sem categoria';
            categories[categoria] = (categories[categoria] || 0) + (d.valor || 0);
        });

        const chart = new Chart(ctx, {
            type: type,
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Valor Total (R$)',
                    data: Object.values(categories),
                    backgroundColor: [
                        'rgba(196, 155, 97, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(196, 155, 97, 1)',
                        'rgba(5, 150, 105, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição de Doações por Categoria',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return utils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        window.currentChart = chart;
        return chart;
    } catch (error) {
        console.error('Erro ao criar gráfico:', error);
        return null;
    }
}

// Função para contar filtros ativos
function updateActiveFiltersCount() {
    const activeFiltersCount = getElement('activeFiltersCount');
    const clearFiltersBtn = getElement('clearFiltersBtn');
    
    if (!activeFiltersCount || !clearFiltersBtn) return;
    
    let activeCount = 0;
    
    const startDateFilter = getElement('startDateFilter');
    const endDateFilter = getElement('endDateFilter');
    const typeFilter = getElement('typeFilter');
    const categoryFilter = getElement('categoryFilter');
    
    if (startDateFilter?.value && startDateFilter.value !== '2023-09-12') activeCount++;
    if (endDateFilter?.value && endDateFilter.value !== '2025-10-19') activeCount++;
    if (typeFilter?.value) activeCount++;
    if (categoryFilter?.value) activeCount++;
    
    if (activeCount > 0) {
        activeFiltersCount.textContent = activeCount;
        activeFiltersCount.style.display = 'flex';
        clearFiltersBtn.classList.add('visible');
    } else {
        activeFiltersCount.style.display = 'none';
        clearFiltersBtn.classList.remove('visible');
    }
}

// Função para limpar todos os filtros
function clearAllFilters() {
    const startDateFilter = getElement('startDateFilter');
    const endDateFilter = getElement('endDateFilter');
    const typeFilter = getElement('typeFilter');
    const categoryFilter = getElement('categoryFilter');
    
    if (startDateFilter) startDateFilter.value = '2023-09-12';
    if (endDateFilter) endDateFilter.value = '2025-10-19';
    if (typeFilter) typeFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
    currentPage = 1;
    renderTable();
    updateActiveFiltersCount();
    
    notification.show('Filtros limpos com sucesso!', 'info', 3000);
}

// Função para alternar filtros (mobile)
function toggleFilters() {
    const filtersContent = getElement('filtersContent');
    const filtersToggle = getElement('filtersToggle');
    
    if (!filtersContent || !filtersToggle) return;
    
    const isCollapsed = filtersContent.classList.contains('collapsed');
    
    if (isCollapsed) {
        filtersContent.classList.remove('collapsed');
        filtersToggle.classList.add('active');
        console.log('Filtros expandidos');
    } else {
        filtersContent.classList.add('collapsed');
        filtersToggle.classList.remove('active');
        console.log('Filtros colapsados');
    }
}

// Função para adicionar nova doação na tabela
function addDonationToTable(donation, isNew = false) {
    if (!donation || typeof donation !== 'object') {
        console.error('Doação inválida:', donation);
        return;
    }
    
    // Adicionar timestamp se não existir
    if (!donation.timestamp) {
        donation.timestamp = Date.now();
    }
    
    donations.unshift(donation);
    
    if (isNew) {
        currentPage = 1;
        renderTable();
        
        setTimeout(() => {
            const tableBody = getElement('tableBody');
            const firstRow = tableBody?.querySelector('.table-row1');
            if (firstRow) {
                firstRow.classList.add('new-entry');
                setTimeout(() => {
                    firstRow.classList.remove('new-entry');
                }, 3000);
            }
        }, 100);
    }
}

// Função para gerar relatório com dados filtrados por período
function generateReport() {
    try {
        const reportType = getElement('reportType')?.value || 'Anual';
        const reportCategory = getElement('reportCategory')?.value || 'Geral';
        const responsible = getElement('responsible')?.value || 'Sistema';
        const startPeriod = getElement('startPeriod');
        const endPeriod = getElement('endPeriod');

        // Obter intervalo de datas baseado no tipo de relatório OU nas datas selecionadas
        let dateRange;
        
        if (startPeriod?.value && endPeriod?.value) {
            // Usar datas personalizadas se fornecidas
            dateRange = {
                start: new Date(startPeriod.value),
                end: new Date(endPeriod.value)
            };
        } else {
            // Usar intervalo automático baseado no tipo
            dateRange = utils.getDateRange(reportType);
        }
        
        // Validar intervalo de datas
        if (dateRange.start > dateRange.end) {
            notification.show('Data inicial não pode ser maior que a data final!', 'error');
            return;
        }
        
        // Filtrar doações por período e categoria
        let filteredData = donations.filter(donation => {
            try {
                const dateMatch = utils.isDateInRange(donation.data, dateRange);
                const categoryMatch = reportCategory === 'Geral' || donation.categoria === reportCategory;
                return dateMatch && categoryMatch;
            } catch (error) {
                console.error('Erro ao filtrar doação:', error);
                return false;
            }
        });

        if (filteredData.length === 0) {
            notification.show('Nenhum registro encontrado no período selecionado!', 'warning');
            return;
        }

        const reportData = {
            id: nextId++,
            data: utils.getCurrentDateISO(),
            tipo: 'Relatório',
            categoria: reportCategory,
            responsavel: responsible,
            valor: filteredData.reduce((sum, d) => sum + (d.valor || 0), 0),
            origem: 'relatorio',
            timestamp: Date.now(),
            periodo: `${utils.formatDate(dateRange.start)} - ${utils.formatDate(dateRange.end)}`,
            tipoRelatorio: reportType,
            dadosFiltrados: filteredData
        };

        // Adicionar na tabela
        addDonationToTable(reportData, true);

        // Gerar PDF
        generatePDF(reportData.id);

        notification.show(
            `Relatório ${reportType} gerado!<br>
            <strong>${reportCategory}</strong> - ${filteredData.length} registros<br>
            Período: ${reportData.periodo}`, 
            'success', 
            5000
        );

        console.log('Relatório gerado:', reportData);
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        notification.show('Erro ao gerar relatório. Tente novamente.', 'error');
    }
}

// Função para filtrar doações
function getFilteredDonations() {
    try {
        return donations.filter(donation => {
            if (!donation || !donation.data) return false;
            
            const donationDate = new Date(donation.data);
            if (isNaN(donationDate.getTime())) return false;
            
            const startDateFilter = getElement('startDateFilter');
            const endDateFilter = getElement('endDateFilter');
            const typeFilter = getElement('typeFilter');
            const categoryFilter = getElement('categoryFilter');
            
            const startDate = startDateFilter?.value ? new Date(startDateFilter.value) : null;
            const endDate = endDateFilter?.value ? new Date(endDateFilter.value) : null;
            
            const dateMatch = (!startDate || donationDate >= startDate) && (!endDate || donationDate <= endDate);
            const typeMatch = !typeFilter?.value || donation.tipo === typeFilter.value;
            const categoryMatch = !categoryFilter?.value || donation.categoria === categoryFilter.value;
            
            return dateMatch && typeMatch && categoryMatch;
        });
    } catch (error) {
        console.error('Erro ao filtrar doações:', error);
        return donations;
    }
}

// Função para renderizar a tabela com formato brasileiro de data
function renderTable() {
    const tableBody = getElement('tableBody');
    if (!tableBody) {
        console.error('Elemento tableBody não encontrado');
        return;
    }

    try {
        const filteredDonations = getFilteredDonations();
        const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedDonations = filteredDonations.slice(startIndex, endIndex);

        tableBody.innerHTML = '';

        if (paginatedDonations.length === 0) {
            tableBody.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    Nenhuma doação encontrada com os filtros aplicados.
                </div>
            `;
            renderPagination(0);
            return;
        }

        paginatedDonations.forEach((donation) => {
            const row = document.createElement('div');
            row.className = 'table-row1';
            
            const typeClass = donation.tipo.toLowerCase()
                .replace(/ó/g, 'o')
                .replace(/ã/g, 'a')
                .replace(/á/g, 'a')
                .replace(/ê/g, 'e')
                .replace(/í/g, 'i')
                .replace(/ú/g, 'u') + '1';
            
            const originClass = donation.origem + '1';
            const originText = donation.origem === 'externo' ? 'Externo' : 
                             donation.origem === 'relatorio' ? 'Relatório' : 'Manual';
            
            row.innerHTML = `
                <div>${utils.formatDate(donation.data)}</div>
                <div><span class="type-badge1 ${typeClass}">${donation.tipo}</span></div>
                <div>${donation.categoria || 'N/A'}</div>
                <div><span class="origin-badge1 ${originClass}">${originText}</span></div>
                <div>
                    <button class="pdf-btn1" type="button" onclick="generatePDF(${donation.id})" title="Gerar PDF">
                        PDF <i class="fas fa-download"></i>
                    </button>
                </div>
            `;
            
            tableBody.appendChild(row);
        });

        renderPagination(totalPages);
        
    } catch (error) {
        console.error('Erro ao renderizar tabela:', error);
        tableBody.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                Erro ao carregar dados. Recarregue a página.
            </div>
        `;
    }
}

// Função para renderizar paginação
function renderPagination(totalPages) {
    const pagination = getElement('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Botão anterior
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn1';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => {
            currentPage--;
            renderTable();
        };
        pagination.appendChild(prevBtn);
    }

    // Páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn1';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => {
            currentPage = 1;
            renderTable();
        };
        pagination.appendChild(firstBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            pagination.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.className = `page-btn1 ${i === currentPage ? 'active' : ''}`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            renderTable();
        };
        pagination.appendChild(button);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            pagination.appendChild(ellipsis);
        }

        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn1';
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => {
            currentPage = totalPages;
            renderTable();
        };
        pagination.appendChild(lastBtn);
    }

    // Botão próximo
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn1';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => {
            currentPage++;
            renderTable();
        };
        pagination.appendChild(nextBtn);
    }
}

// Função para gerar PDF com datas em formato brasileiro
function generatePDF(donationId = null) {
    const pdfLoading = getElement('pdfLoading');
    if (!pdfLoading) {
        console.error('Elemento pdfLoading não encontrado');
        return;
    }

    pdfLoading.classList.add('show1');
    
    setTimeout(async () => {
        try {
            if (!window.jspdf) {
                throw new Error('Biblioteca jsPDF não foi carregada');
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            let reportData;
            let fileName;
            
            if (donationId) {
                const donation = donations.find(d => d.id === donationId);
                if (!donation) {
                    throw new Error('Registro não encontrado');
                }
                
                if (donation.tipo === 'Relatório' && donation.dadosFiltrados) {
                    reportData = donation.dadosFiltrados;
                    fileName = `Relatorio_${donation.tipoRelatorio}_${donation.categoria}_${donation.id}_${utils.getCurrentDateISO().replace(/-/g, '')}.pdf`;
                } else {
                    reportData = [donation];
                    fileName = `${donation.tipo}_${donation.categoria}_${donation.id}_${utils.getCurrentDateISO().replace(/-/g, '')}.pdf`;
                }
            } else {
                reportData = getFilteredDonations();
                fileName = `Relatorio_Geral_${utils.getCurrentDateISO().replace(/-/g, '')}.pdf`;
            }

            await createABNTPDFDocument(doc, reportData, fileName);
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            notification.show(`Erro ao gerar PDF: ${error.message}`, 'error');
        } finally {
            pdfLoading.classList.remove('show1');
        }
    }, 800);
}

// Função para criar documento PDF em formato ABNT com datas brasileiras
async function createABNTPDFDocument(doc, data, fileName) {
    try {
        const margin = 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let currentY = margin;

        // Função auxiliar para adicionar texto com quebra de linha
        function addText(text, fontSize, isBold = false, align = 'left', maxWidth = pageWidth - 2 * margin) {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            
            let x = margin;
            if (align === 'center') {
                x = pageWidth / 2;
            } else if (align === 'right') {
                x = pageWidth - margin;
            }
            
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                if (currentY > pageHeight - 40) {
                    doc.addPage();
                    currentY = margin;
                }
                doc.text(line, x, currentY, { align: align });
                currentY += fontSize * 0.8;
            });
            
            return lines.length;
        }

        // CAPA (Formato ABNT)
        currentY = pageHeight / 4;
        addText('SISTEMA DE HISTÓRICO DE DOAÇÕES', 16, true, 'center');
        currentY += 20;
        addText('RELATÓRIO DE ANÁLISE DE DADOS', 14, true, 'center');
        currentY += 40;
        addText('ORGANIZAÇÃO BENEFICENTE', 12, false, 'center');
        currentY += 20;
        addText('Salvador, BA', 12, false, 'center');
        currentY += 10;
        addText(new Date().getFullYear().toString(), 12, false, 'center');

        // Nova página para conteúdo
        doc.addPage();
        currentY = margin;

        // SUMÁRIO
        addText('SUMÁRIO', 14, true, 'center');
        currentY += 20;
        addText('1. INTRODUÇÃO ....................................... 3', 12);
        addText('2. METODOLOGIA .................................... 4', 12);
        addText('3. ANÁLISE DOS DADOS ........................... 5', 12);
        addText('4. RESULTADOS ..................................... 6', 12);
        addText('5. GRÁFICOS E ESTATÍSTICAS .................... 7', 12);
        addText('6. CONCLUSÕES .................................... 8', 12);
        addText('7. ANEXOS .......................................... 9', 12);

        // Nova página - Introdução
        doc.addPage();
        currentY = margin;
        
        addText('1. INTRODUÇÃO', 14, true);
        currentY += 15;
        
        const totalValue = data.reduce((sum, d) => sum + (d.valor || 0), 0);
        const intro = `Este relatório apresenta uma análise detalhada dos dados de doações registrados no Sistema de Histórico de Doações da organização.

Total de registros analisados: ${data.length}
Valor total: ${utils.formatCurrency(totalValue)}
Data de geração: ${utils.getCurrentDateBR()} às ${new Date().toLocaleTimeString('pt-BR')}
Arquivo: ${fileName}`;

        addText(intro, 12, false, 'justify');

        // Nova página - Dados
        doc.addPage();
        currentY = margin;
        
        addText('3. DADOS DETALHADOS', 14, true);
        currentY += 20;

        // Tabela de dados com datas formatadas em brasileiro
        data.forEach((donation, index) => {
            if (currentY > pageHeight - 60) {
                doc.addPage();
                currentY = margin;
            }
            
            const donationText = `${index + 1}. ${utils.formatDate(donation.data)} - ${donation.tipo} - ${donation.categoria} - ${donation.responsavel} - ${utils.formatCurrency(donation.valor)}`;
            addText(donationText, 10);
            currentY += 5;
        });

        // Salvar PDF
        doc.save(fileName);
        notification.show(`PDF gerado com sucesso!<br>Arquivo: <strong>${fileName}</strong>`, 'success');
        
    } catch (error) {
        console.error('Erro ao criar PDF:', error);
        throw error;
    }
}

// Função global para ser chamada pelos botões
window.generatePDF = generatePDF;

// Event Listeners com tratamento de erro
function initializeEventListeners() {
    try {
        // Toggle de filtros para mobile
        const filtersToggle = getElement('filtersToggle');
        if (filtersToggle) {
            filtersToggle.addEventListener('click', (e) => {
                e.preventDefault();
                toggleFilters();
            });
        }
        
        // Botão limpar filtros
        const clearFiltersBtn = getElement('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clearAllFilters();
            });
        }
        
        // Filtros com debounce para melhor performance
        const debouncedUpdate = utils.debounce(() => {
            currentPage = 1;
            renderTable();
            updateActiveFiltersCount();
        }, 300);
        
        const filterElements = ['startDateFilter', 'endDateFilter', 'typeFilter', 'categoryFilter'];
        filterElements.forEach(elementId => {
            const element = getElement(elementId);
            if (element) {
                element.addEventListener('change', debouncedUpdate);
            }
        });
        
        // Botão gerar relatório
        const generateReportBtn = getElement('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                generateReport();
            });
        }
        
        // Auto-colapsar filtros em telas pequenas
        function handleResize() {
            const filtersContent = getElement('filtersContent');
            const filtersToggle = getElement('filtersToggle');
            
            if (!filtersContent || !filtersToggle) return;
            
            if (window.innerWidth <= 1024) {
                if (!filtersContent.classList.contains('collapsed')) {
                    filtersContent.classList.add('collapsed');
                    filtersToggle.classList.remove('active');
                }
            } else {
                filtersContent.classList.remove('collapsed');
                filtersToggle.classList.remove('active');
            }
        }
        
        window.addEventListener('resize', utils.debounce(handleResize, 250));
        handleResize(); // Executar na inicialização
        
        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r':
                        e.preventDefault();
                        generateReport();
                        break;
                    case 'f':
                        e.preventDefault();
                        toggleFilters();
                        break;
                    case 'l':
                        e.preventDefault();
                        clearAllFilters();
                        break;
                }
            }
        });
        
        // Prevenir submit do formulário
        const reportForm = getElement('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                generateReport();
            });
        }
        
        console.log('Event listeners inicializados com sucesso');
        
    } catch (error) {
        console.error('Erro ao inicializar event listeners:', error);
    }
}

// Função para validar dados
function validateDonation(donation) {
    const required = ['data', 'tipo', 'categoria', 'responsavel'];
    const missing = required.filter(field => !donation[field]);
    
    if (missing.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }
    
    // Validar data
    const date = new Date(donation.data);
    if (isNaN(date.getTime())) {
        throw new Error('Data inválida');
    }
    
    // Validar valor
    if (donation.valor && (isNaN(donation.valor) || donation.valor < 0)) {
        throw new Error('Valor inválido');
    }
    
    return true;
}

// Função de inicialização aprimorada
function initialize() {
    try {
        console.log('Inicializando Sistema de Histórico de Doações...');
        
        // Verificar se o DOM está pronto
        if (document.readyState === 'loading') {
            console.log('DOM ainda carregando, aguardando...');
            return;
        }
        
        // Verificar dependências
        const dependencies = {
            jsPDF: window.jspdf,
            Chart: window.Chart
        };
        
        Object.entries(dependencies).forEach(([name, dep]) => {
            if (!dep) {
                console.warn(`${name} não carregado - algumas funcionalidades podem não funcionar`);
            } else {
                console.log(`${name} carregado com sucesso`);
            }
        });
        
        // Verificar elementos essenciais
        const essentialElements = ['tableBody'];
        const missingElements = essentialElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.error('Elementos essenciais não encontrados:', missingElements);
            notification.show('Erro: Elementos da interface não encontrados. Verifique o HTML.', 'error');
            return;
        }
        
        // Validar dados iniciais
        donations = donations.filter(donation => {
            try {
                validateDonation(donation);
                return true;
            } catch (error) {
                console.warn('Doação inválida removida:', donation, error.message);
                return false;
            }
        });
        
        // Ordenar doações por data (mais recentes primeiro)
        donations.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        
        initializeEventListeners();
        renderTable();
        updateActiveFiltersCount();
        
        console.log(`Sistema inicializado com sucesso! ${donations.length} registros carregados`);
        
        // Notificação de sucesso com delay
        setTimeout(() => {
            notification.show(
                `Sistema carregado com sucesso!<br>
                <strong>${donations.length}</strong> registros disponíveis<br>
                Datas em formato brasileiro: <strong>dd/mm/aaaa</strong>`, 
                'info', 
                4000
            );
        }, 1000);
        
        // Criar gráfico inicial se possível
        if (window.Chart) {
            setTimeout(() => {
                createChart(donations);
            }, 1500);
        }
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        notification.show('Erro ao inicializar o sistema. Recarregue a página.', 'error');
    }
}

// Função para reinicializar se necessário
function reinitialize() {
    console.log('Reinicializando sistema...');
    elements = {}; // Limpar cache de elementos
    initialize();
}

// Inicializar quando a página carregar
function startSystem() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // Pequeno delay para garantir que todos os scripts foram carregados
        setTimeout(initialize, 100);
    }
}

// API para integração futura aprimorada com suporte a datas brasileiras
window.DonationSystem = {
    addExternalData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Dados inválidos fornecidos');
            }
            
            // Converter data brasileira para formato ISO se necessário
            let isoDate = data.date;
            if (data.date && data.date.includes('/')) {
                isoDate = utils.parseBrazilianDate(data.date);
            }
            
            const donation = {
                id: nextId++,
                data: isoDate || utils.getCurrentDateISO(),
                tipo: data.type || 'Pontual',
                categoria: data.category || 'Geral',
                responsavel: data.responsible || 'Sistema Externo',
                valor: parseFloat(data.value) || 0,
                origem: 'externo',
                timestamp: Date.now(),
                ...data
            };
            
            validateDonation(donation);
            addDonationToTable(donation, true);
            
            notification.show(
                `Dados recebidos via API!<br>
                <strong>${donation.categoria}</strong><br>
                Data: ${utils.formatDate(donation.data)}<br>
                Por: ${donation.responsavel}`, 
                'info'
            );
            
            return donation.id;
            
        } catch (error) {
            console.error('Erro ao adicionar dados externos:', error);
            notification.show(`Erro ao adicionar dados: ${error.message}`, 'error');
            return null;
        }
    },
    
    getFilteredData() {
        try {
            return getFilteredDonations();
        } catch (error) {
            console.error('Erro ao obter dados filtrados:', error);
            return [];
        }
    },
    
    getAllData() {
        return [...donations]; // Retornar cópia para evitar modificações externas
    },
    
    generateReport(config = {}) {
        try {
            const responsible = getElement('responsible');
            const startPeriod = getElement('startPeriod');
            const endPeriod = getElement('endPeriod');
            const reportType = getElement('reportType');
            const reportCategory = getElement('reportCategory');
            
            if (config.responsible && responsible) responsible.value = config.responsible;
            
            // Suporte para datas em formato brasileiro
            if (config.startDate && startPeriod) {
                const isoStartDate = config.startDate.includes('/') ? 
                    utils.parseBrazilianDate(config.startDate) : config.startDate;
                startPeriod.value = isoStartDate;
            }
            
            if (config.endDate && endPeriod) {
                const isoEndDate = config.endDate.includes('/') ? 
                    utils.parseBrazilianDate(config.endDate) : config.endDate;
                endPeriod.value = isoEndDate;
            }
            
            if (config.type && reportType) reportType.value = config.type;
            if (config.category && reportCategory) reportCategory.value = config.category;
            
            generateReport();
        } catch (error) {
            console.error('Erro ao gerar relatório via API:', error);
            notification.show(`Erro ao gerar relatório: ${error.message}`, 'error');
        }
    },
    
    updateFilters(filters = {}) {
        try {
            const filterElements = {
                startDate: getElement('startDateFilter'),
                endDate: getElement('endDateFilter'),
                type: getElement('typeFilter'),
                category: getElement('categoryFilter')
            };
            
            Object.entries(filters).forEach(([key, value]) => {
                if (filterElements[key] && value !== undefined) {
                    // Converter datas brasileiras para formato ISO
                    if ((key === 'startDate' || key === 'endDate') && value.includes('/')) {
                        value = utils.parseBrazilianDate(value);
                    }
                    filterElements[key].value = value;
                }
            });
            
            currentPage = 1;
            renderTable();
            updateActiveFiltersCount();
            
        } catch (error) {
            console.error('Erro ao atualizar filtros via API:', error);
        }
    },
    
    // Função utilitária para conversão de datas
    formatDateBR(dateString) {
        return utils.formatDate(dateString);
    },
    
    parseBrazilianDate(dateString) {
        return utils.parseBrazilianDate(dateString);
    },
    
    getCurrentDateBR() {
        return utils.getCurrentDateBR();
    },
    
    reinitialize,
    
    getStats() {
        try {
            const filteredData = getFilteredDonations();
            const stats = {
                total: filteredData.length,
                totalValue: filteredData.reduce((sum, d) => sum + (d.valor || 0), 0),
                categories: {},
                types: {},
                origins: {},
                dateRange: {
                    earliest: filteredData.length > 0 ? utils.formatDate(Math.min(...filteredData.map(d => new Date(d.data)))) : null,
                    latest: filteredData.length > 0 ? utils.formatDate(Math.max(...filteredData.map(d => new Date(d.data)))) : null
                }
            };
            
            filteredData.forEach(d => {
                stats.categories[d.categoria] = (stats.categories[d.categoria] || 0) + 1;
                stats.types[d.tipo] = (stats.types[d.tipo] || 0) + 1;
                stats.origins[d.origem] = (stats.origins[d.origem] || 0) + 1;
            });
            
            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return null;
        }
    }
};

// Tratamento de erros globais
window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
    if (event.error.message.includes('jspdf') || event.error.message.includes('Chart')) {
        notification.show('Erro nas bibliotecas externas. Recarregue a página.', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada:', event.reason);
    event.preventDefault();
});

// Log de status
console.log('Sistema de Histórico de Doações carregado');
console.log('Formato de data: dd/mm/yyyy (brasileiro)');
console.log('API disponível: window.DonationSystem');
console.log('Atalhos disponíveis: Ctrl+R (relatório), Ctrl+F (filtros), Ctrl+L (limpar filtros)');

// Inicializar o sistema
startSystem();