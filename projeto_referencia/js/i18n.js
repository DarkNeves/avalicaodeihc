const STORAGE_KEY = "farolLanguage";
const DEFAULT_LANGUAGE = "pt-BR";
const SUPPORTED_LANGUAGES = [DEFAULT_LANGUAGE, "en", "es"];
const LANGUAGE_CODES = { "pt-BR": "PT", en: "EN", es: "ES" };
const listeners = new Set();
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

const TRANSLATION_ROWS = [
  ["Selecionar idioma", "Select language", "Seleccionar idioma"],
  ["Acesso em Foco - Análise de Acessibilidade", "Accessibility in Focus - Accessibility Analysis", "Accesibilidad en Foco - Análisis de Accesibilidad"],
  ["Apresentação acadêmica sobre análise de acessibilidade em aplicativos móveis com ferramentas de inspeção de acessibilidade.", "Academic presentation on accessibility analysis in mobile applications using accessibility inspection tools.", "Presentación académica sobre análisis de accesibilidad en aplicaciones móviles mediante herramientas de inspección de accesibilidad."],
  ["Pular para o conteúdo principal", "Skip to main content", "Saltar al contenido principal"],
  ["Análise de Acessibilidade", "Accessibility Analysis", "Análisis de Accesibilidad"],
  ["Análise de Acessibilidade em Aplicativos", "Accessibility Analysis in Applications", "Análisis de Accesibilidad en Aplicaciones"],
  ["Aplicativos móveis", "Mobile applications", "Aplicaciones móviles"],
  ["Análise de Acessibilidade - voltar ao início", "Accessibility Analysis - return to the beginning", "Análisis de Accesibilidad - volver al inicio"],
  ["Navegação principal", "Main navigation", "Navegación principal"],
  ["Menu", "Menu", "Menú"],
  ["Configurar site", "Configure site", "Configurar sitio"],
  ["Objetivo", "Objective", "Objetivo"],
  ["Metodologia", "Methodology", "Metodología"],
  ["Aplicativos", "Applications", "Aplicaciones"],
  ["Síntese", "Summary", "Síntesis"],
  ["Configuração", "Settings", "Configuración"],
  ["Preferências de leitura", "Reading preferences", "Preferencias de lectura"],
  ["Fechar configurações", "Close settings", "Cerrar configuración"],
  ["Ajuste a apresentação conforme sua necessidade. As escolhas ficam salvas neste navegador.", "Adjust the presentation to your needs. Your choices are saved in this browser.", "Ajusta la presentación según tus necesidades. Las opciones quedan guardadas en este navegador."],
  ["Tamanho do texto", "Text size", "Tamaño del texto"],
  ["Reduzido - 90%", "Reduced - 90%", "Reducido - 90%"],
  ["Padrão - 100%", "Default - 100%", "Predeterminado - 100%"],
  ["Ampliado - 112%", "Enlarged - 112%", "Ampliado - 112%"],
  ["Ampliado - 125%", "Enlarged - 125%", "Ampliado - 125%"],
  ["Padrão", "Default", "Predeterminado"],
  ["Diminuir tamanho do texto", "Decrease text size", "Disminuir el tamaño del texto"],
  ["Aumentar tamanho do texto", "Increase text size", "Aumentar el tamaño del texto"],
  ["Contraste reforçado", "Enhanced contrast", "Contraste reforzado"],
  ["Aprofunda a diferença entre textos e superfícies.", "Increases the difference between text and surfaces.", "Aumenta la diferencia entre textos y superficies."],
  ["Alto contraste", "High contrast", "Alto contraste"],
  ["Aplica uma combinação máxima de preto, branco e amarelo.", "Applies a maximum-contrast combination of black, white, and yellow.", "Aplica una combinación de máximo contraste de negro, blanco y amarillo."],
  ["Maior espaçamento de texto", "Increased text spacing", "Mayor espaciado de texto"],
  ["Aumenta altura das linhas e distância entre caracteres.", "Increases line height and spacing between characters.", "Aumenta la altura de línea y la distancia entre caracteres."],
  ["Destacar links", "Highlight links", "Destacar enlaces"],
  ["Destaque de links", "Link highlighting", "Resaltado de enlaces"],
  ["Reforça sublinhado e identificação dos links de texto.", "Strengthens underlining and identification of text links.", "Refuerza el subrayado y la identificación de los enlaces de texto."],
  ["Scroll suave", "Smooth scrolling", "Desplazamiento suave"],
  ["Suaviza a rolagem entre as áreas da página.", "Smooths scrolling between page areas.", "Suaviza el desplazamiento entre las áreas de la página."],
  ["Restaurar padrão", "Restore defaults", "Restaurar valores predeterminados"],
  ["Concluir", "Done", "Finalizar"],
  ["Ativar tema escuro", "Enable dark theme", "Activar tema oscuro"],
  ["Ativar tema claro", "Enable light theme", "Activar tema claro"],
  ["Tema escuro ativado.", "Dark theme enabled.", "Tema oscuro activado."],
  ["Tema claro ativado.", "Light theme enabled.", "Tema claro activado."],
  ["Tamanho do texto restaurado para 100%.", "Text size restored to 100%.", "Tamaño del texto restaurado al 100%."],
  ["Todas as configurações foram restauradas para o padrão.", "All settings have been restored to their defaults.", "Toda la configuración se restauró a sus valores predeterminados."],
  ["ativado", "enabled", "activado"],
  ["desativado", "disabled", "desactivado"],
  ["Não foi possível salvar as preferências de acessibilidade.", "Accessibility preferences could not be saved.", "No se pudieron guardar las preferencias de accesibilidad."],

  ["Apresentação acadêmica", "Academic presentation", "Presentación académica"],
  ["Avaliação de interfaces mobile utilizando ferramentas de inspeção de acessibilidade.", "Evaluation of mobile interfaces using accessibility inspection tools.", "Evaluación de interfaces móviles mediante herramientas de inspección de accesibilidad."],
  ["3 aplicativos", "3 applications", "3 aplicaciones"],
  ["aplicativos analisados", "applications analyzed", "aplicaciones analizadas"],
  ["barreiras de acessibilidade", "accessibility barriers", "barreras de accesibilidad"],
  ["propostas de solução", "solution proposals", "propuestas de solución"],
  ["Disciplina", "Subject", "Asignatura"],
  ["MULTIMÍDIA E INTERAÇÃO HUMANO-COMPUTADOR", "MULTIMEDIA AND HUMAN-COMPUTER INTERACTION", "MULTIMEDIA E INTERACCIÓN HUMANO-COMPUTADOR"],
  ["Professor", "Professor", "Profesor"],
  ["Turma", "Class", "Clase"],
  ["MOD 4 - NOTURNO", "MOD 4 - EVENING", "MOD 4 - NOCTURNO"],
  ["Apresentação", "Presentation", "Presentación"],
  ["Iniciar apresentação", "Start presentation", "Iniciar presentación"],
  ["Equipe", "Team", "Equipo"],
  ["Integrantes", "Team Members", "Integrantes"],
  ["Equipe responsável pela análise de acessibilidade.", "Team responsible for the accessibility analysis.", "Equipo responsable del análisis de accesibilidad."],
  ["O ponto de partida", "The starting point", "El punto de partida"],
  ["Esta atividade tem como objetivo avaliar a acessibilidade de aplicativos móveis utilizando uma ferramenta de inspeção de acessibilidade. Foram analisados três aplicativos diferentes para identificar possíveis barreiras de interação e compreender as recomendações apresentadas pela ferramenta para melhorar a experiência dos usuários.", "This activity aims to evaluate the accessibility of mobile applications using an accessibility inspection tool. Three different applications were analyzed to identify potential interaction barriers and understand the tool's recommendations for improving the user experience.", "Esta actividad tiene como objetivo evaluar la accesibilidad de aplicaciones móviles mediante una herramienta de inspección de accesibilidad. Se analizaron tres aplicaciones diferentes para identificar posibles barreras de interacción y comprender las recomendaciones de la herramienta para mejorar la experiencia de las personas usuarias."],
  ["Observar, registrar e propor melhorias sem substituir a avaliação humana.", "Observe, document, and propose improvements without replacing human evaluation.", "Observar, registrar y proponer mejoras sin sustituir la evaluación humana."],
  ["Como a análise foi realizada", "How the analysis was conducted", "Cómo se realizó el análisis"],
  ["Um processo direto em quatro etapas, da escolha dos aplicativos à interpretação dos resultados.", "A straightforward four-step process, from selecting the applications to interpreting the results.", "Un proceso directo en cuatro etapas, desde la selección de las aplicaciones hasta la interpretación de los resultados."],
  ["Selecionar os aplicativos", "Select the applications", "Seleccionar las aplicaciones"],
  ["Definir três interfaces mobile para a avaliação.", "Choose three mobile interfaces for the evaluation.", "Definir tres interfaces móviles para la evaluación."],
  ["Executar o Scanner de Acessibilidade", "Run the Accessibility Scanner", "Ejecutar el Escáner de Accesibilidad"],
  ["Inspecionar as telas escolhidas com a ferramenta.", "Inspect the selected screens with the tool.", "Inspeccionar las pantallas seleccionadas con la herramienta."],
  ["Identificar os problemas", "Identify the problems", "Identificar los problemas"],
  ["Registrar as barreiras apontadas durante a análise.", "Document the barriers reported during the analysis.", "Registrar las barreras señaladas durante el análisis."],
  ["Analisar as recomendações", "Analyze the recommendations", "Analizar las recomendaciones"],
  ["Relacionar cada diagnóstico a uma possível correção.", "Relate each diagnosis to a possible correction.", "Relacionar cada diagnóstico con una posible corrección."],

  ["Aplicativo analisado", "Application analyzed", "Aplicación analizada"],
  ["Aplicativo 01 - Uber", "Application 01 - Uber", "Aplicación 01 - Uber"],
  ["Aplicativo 02 - SHEIN", "Application 02 - SHEIN", "Aplicación 02 - SHEIN"],
  ["Aplicativo 03 - Google Play Store", "Application 03 - Google Play Store", "Aplicación 03 - Google Play Store"],
  ["O aplicativo foi analisado com o Scanner de Acessibilidade. Os estudos de caso a seguir apresentam achados reais obtidos em diferentes telas da Uber.", "The application was analyzed with the Accessibility Scanner. The following case studies present real findings obtained from different Uber screens.", "La aplicación fue analizada con el Escáner de Accesibilidad. Los siguientes estudios de caso presentan hallazgos reales obtenidos en diferentes pantallas de Uber."],
  ["A tela inicial da SHEIN foi inspecionada com o Scanner de Acessibilidade para identificar barreiras de interação, descrição e adaptação do texto.", "The SHEIN home screen was inspected with the Accessibility Scanner to identify interaction, description, and text adaptation barriers.", "La pantalla de inicio de SHEIN fue inspeccionada con el Escáner de Accesibilidad para identificar barreras de interacción, descripción y adaptación del texto."],
  ["A Google Play Store foi analisada com o Scanner de Acessibilidade em diferentes telas da aplicação. Os achados selecionados apresentam problemas relacionados ao contraste do texto, à exposição de conteúdo para serviços de acessibilidade e à organização de elementos interativos.", "Google Play Store was analyzed with the Accessibility Scanner across different application screens. The selected findings cover problems related to text contrast, content exposure to accessibility services, and the organization of interactive elements.", "Google Play Store fue analizada con el Escáner de Accesibilidad en diferentes pantallas de la aplicación. Los hallazgos seleccionados presentan problemas relacionados con el contraste del texto, la exposición de contenido a los servicios de accesibilidad y la organización de los elementos interactivos."],

  ["BUG 01", "BUG 01", "ERROR 01"],
  ["BUG 02", "BUG 02", "ERROR 02"],
  ["BUG 03", "BUG 03", "ERROR 03"],
  ["Detectado", "Detected", "Detectado"],
  ["Recomendado", "Recommended", "Recomendado"],
  ["ACHADO DO SCANNER", "SCANNER FINDING", "HALLAZGO DEL ESCÁNER"],
  ["Problema encontrado", "Problem found", "Problema encontrado"],
  ["IMPACTO", "IMPACT", "IMPACTO"],
  ["Impacto na acessibilidade", "Accessibility impact", "Impacto en la accesibilidad"],
  ["RECOMENDAÇÃO DO SCANNER", "SCANNER RECOMMENDATION", "RECOMENDACIÓN DEL ESCÁNER"],
  ["O que a ferramenta orienta", "What the tool recommends", "Lo que recomienda la herramienta"],
  ["REGISTRO DO SCANNER", "SCANNER RECORD", "REGISTRO DEL ESCÁNER"],
  ["Orientação disponível no relatório", "Guidance available in the report", "Orientación disponible en el informe"],
  ["PROPOSTA DA EQUIPE", "TEAM PROPOSAL", "PROPUESTA DEL EQUIPO"],
  ["Solução sugerida", "Suggested solution", "Solución sugerida"],
  ["Evidência", "Evidence", "Evidencia"],
  ["Ampliar evidência", "Enlarge evidence", "Ampliar evidencia"],
  ["Texto pequeno", "Small text", "Texto pequeño"],
  ["Texto repetido", "Repeated text", "Texto repetido"],
  ["Item identificado", "Item identified", "Elemento identificado"],
  ["Afeta", "Affects", "Afecta"],
  ["Situação", "Situation", "Situación"],
  ["O que foi identificado", "What was identified", "Lo que se identificó"],

  ["Área de toque", "Touch target", "Área táctil"],
  ["Área de toque muito pequena", "Touch target is too small", "Área táctil demasiado pequeña"],
  ["Dois elementos clicáveis da tela apresentam altura muito menor que a indicada pela ferramenta.", "Two clickable elements on the screen are much shorter than the size indicated by the tool.", "Dos elementos clicables de la pantalla tienen una altura muy inferior a la indicada por la herramienta."],
  ["Dois itens clicáveis, localizados nas áreas", "Two clickable items, located in the areas", "Dos elementos clicables, ubicados en las áreas"],
  ["e", "and", "y"],
  [", possuem apenas 18dp de altura.", ", are only 18dp high.", ", tienen solo 18dp de altura."],
  ["Alvos pequenos dificultam a interação de pessoas com limitações motoras, tremores ou menor precisão nos movimentos.", "Small targets make interaction more difficult for people with motor limitations, tremors, or reduced movement precision.", "Los objetivos pequeños dificultan la interacción de personas con limitaciones motoras, temblores o menor precisión de movimiento."],
  ["“Considere definir a altura desta área de toque como 48dp ou maior.”", "“Consider setting the height of this touch target to 48dp or greater.”", "“Considere establecer la altura de esta área táctil en 48dp o más.”"],
  ["Ampliar a região interativa do componente para pelo menos 48dp, sem a necessidade de aumentar excessivamente seu tamanho visual.", "Increase the component's interactive region to at least 48dp without unnecessarily enlarging its visual appearance.", "Ampliar la región interactiva del componente a por lo menos 48dp, sin aumentar innecesariamente su tamaño visual."],
  ["Evidência - alvos de 18dp", "Evidence - 18dp targets", "Evidencia - objetivos de 18dp"],
  ["Os contornos do scanner marcam “4,96” e “Não verificado”.", "The scanner outlines mark “4,96” and “Not verified”.", "Los contornos del escáner marcan “4,96” y “No verificado”."],
  ["Contraste do texto", "Text contrast", "Contraste del texto"],
  ["Baixo contraste do texto", "Low text contrast", "Bajo contraste del texto"],
  ["Três textos sobre o fundo vermelho ficaram abaixo da relação de contraste indicada para textos pequenos.", "Three texts on the red background fell below the contrast ratio indicated for small text.", "Tres textos sobre el fondo rojo quedaron por debajo de la relación de contraste indicada para textos pequeños."],
  ["A ferramenta encontrou relação de contraste de 3,42 em três textos, estimando primeiro plano", "The tool found a contrast ratio of 3,42 in three texts, estimating foreground", "La herramienta encontró una relación de contraste de 3,42 en tres textos, estimando un primer plano"],
  ["e fundo", "and background", "y un fondo"],
  ["O baixo contraste pode dificultar a leitura para pessoas com baixa visão ou outras dificuldades visuais.", "Low contrast can make reading difficult for people with low vision or other visual difficulties.", "El bajo contraste puede dificultar la lectura para personas con baja visión u otras dificultades visuales."],
  ["Usar cores com contraste maior que 4,50 para textos pequenos ou 3,00 para textos grandes.", "Use colors with contrast greater than 4,50 for small text or 3,00 for large text.", "Usar colores con un contraste superior a 4,50 para textos pequeños o 3,00 para textos grandes."],
  ["Ajustar a cor do texto, a cor do fundo ou ambas até atingir uma relação de contraste adequada, seguida de nova verificação.", "Adjust the text color, background color, or both until an adequate contrast ratio is reached, then check it again.", "Ajustar el color del texto, el color del fondo o ambos hasta alcanzar una relación de contraste adecuada y volver a comprobarla."],
  ["Evidência - contraste de 3,42:1", "Evidence - 3,42:1 contrast", "Evidencia - contraste de 3,42:1"],
  ["Os contornos do scanner marcam as três etiquetas promocionais.", "The scanner outlines mark the three promotional labels.", "Los contornos del escáner marcan las tres etiquetas promocionales."],
  ["Descrição de itens", "Item descriptions", "Descripciones de elementos"],
  ["Descrições de acessibilidade repetidas", "Repeated accessibility descriptions", "Descripciones de accesibilidad repetidas"],
  ["Controles de ofertas diferentes são anunciados com os mesmos textos falados.", "Controls for different offers are announced with the same spoken text.", "Los controles de ofertas diferentes se anuncian con los mismos textos hablados."],
  ["“Agendar”", "“Schedule”", "“Programar”"],
  ["“Detalhes”", "“Details”", "“Detalles”"],
  ["O texto falado de cada item clicável - “Agendar” e “Detalhes” - é idêntico ao de outro item da tela.", "The spoken text for each clickable item - “Schedule” and “Details” - is identical to that of another item on the screen.", "El texto hablado de cada elemento clicable - “Programar” y “Detalles” - es idéntico al de otro elemento de la pantalla."],
  ["Quem usa leitor de tela pode ouvir a mesma descrição para ofertas diferentes e não identificar com clareza o contexto de cada ação.", "A screen reader user may hear the same description for different offers and be unable to clearly identify the context of each action.", "Una persona que usa lector de pantalla puede oír la misma descripción para ofertas diferentes y no identificar claramente el contexto de cada acción."],
  ["O relatório não fornece uma instrução de correção separada; registra: “Vários itens têm a mesma descrição.”", "The report does not provide a separate correction instruction; it records: “Multiple items have the same description.”", "El informe no proporciona una instrucción de corrección separada; registra: “Varios elementos tienen la misma descripción.”"],
  ["Fornecer contexto suficiente nos rótulos de acessibilidade para diferenciar ações iguais associadas a ofertas distintas. Essa contextualização é uma proposta da equipe, não uma citação do scanner.", "Provide sufficient context in accessibility labels to distinguish identical actions associated with different offers. This contextualization is a team proposal, not a quotation from the scanner.", "Proporcionar suficiente contexto en las etiquetas de accesibilidad para diferenciar acciones iguales asociadas con ofertas distintas. Esta contextualización es una propuesta del equipo, no una cita del escáner."],
  ["Evidência - rótulos repetidos", "Evidence - repeated labels", "Evidencia - etiquetas repetidas"],
  ["Os controles “Agendar” e “Detalhes” aparecem nas duas ofertas.", "The “Schedule” and “Details” controls appear in both offers.", "Los controles “Programar” y “Detalles” aparecen en ambas ofertas."],

  ["Áreas de toque pequenas", "Small touch targets", "Áreas táctiles pequeñas"],
  ["Elementos clicáveis menores que a área recomendada", "Clickable elements smaller than the recommended target", "Elementos clicables menores que el área recomendada"],
  ["O scanner identificou controles interativos com largura ou altura inferior a 48dp.", "The scanner identified interactive controls with a width or height below 48dp.", "El escáner identificó controles interactivos con una anchura o altura inferior a 48dp."],
  ["O scanner detectou elementos clicáveis abaixo do tamanho recomendado. O relatório registra alvos de 36dp × 40dp, 32dp × 36dp e 44dp × 28dp, além de controles de categoria com aproximadamente 38dp de altura.", "The scanner detected clickable elements below the recommended size. The report records targets of 36dp × 40dp, 32dp × 36dp, and 44dp × 28dp, as well as category controls approximately 38dp high.", "El escáner detectó elementos clicables por debajo del tamaño recomendado. El informe registra objetivos de 36dp × 40dp, 32dp × 36dp y 44dp × 28dp, además de controles de categoría de aproximadamente 38dp de altura."],
  ["Alvos pequenos podem dificultar a seleção precisa, especialmente para pessoas com precisão motora reduzida, tremores ou outras limitações motoras.", "Small targets can make accurate selection difficult, especially for people with reduced motor precision, tremors, or other motor limitations.", "Los objetivos pequeños pueden dificultar la selección precisa, especialmente para personas con precisión motora reducida, temblores u otras limitaciones motoras."],
  ["Aumentar a dimensão afetada da área de toque para 48dp ou mais.", "Increase the affected touch-target dimension to 48dp or more.", "Aumentar la dimensión afectada del área táctil a 48dp o más."],
  ["Ampliar a área interativa efetiva dos controles sem aumentar desnecessariamente sua aparência visual.", "Increase the effective interactive area of the controls without unnecessarily enlarging their visual appearance.", "Ampliar el área interactiva efectiva de los controles sin aumentar innecesariamente su apariencia visual."],
  ["Evidência - alvos menores que 48dp", "Evidence - targets smaller than 48dp", "Evidencia - objetivos menores de 48dp"],
  ["Os destaques reforçam os controles superiores e as categorias que apresentam dimensões reduzidas no relatório.", "The highlights emphasize the upper controls and categories that have reduced dimensions in the report.", "Los resaltados señalan los controles superiores y las categorías que presentan dimensiones reducidas en el informe."],
  ["Descrições repetidas", "Repeated descriptions", "Descripciones repetidas"],
  ["Descrição falada repetida em itens “Plus Size”", "Repeated spoken description in “Plus Size” items", "Descripción hablada repetida en elementos “Plus Size”"],
  ["O achado se refere à descrição exposta por itens clicáveis, e não apenas à repetição visual do texto.", "The finding concerns the description exposed by clickable items, not merely the visual repetition of the text.", "El hallazgo se refiere a la descripción expuesta por los elementos clicables, no solo a la repetición visual del texto."],
  ["Descrição repetida", "Repeated description", "Descripción repetida"],
  ["O scanner identificou mais de um item clicável com a mesma descrição falada. O texto “Plus Size” é utilizado de forma idêntica em outro item da tela.", "The scanner identified more than one clickable item with the same spoken description. The text “Plus Size” is used identically in another item on the screen.", "El escáner identificó más de un elemento clicable con la misma descripción hablada. El texto “Plus Size” se utiliza de forma idéntica en otro elemento de la pantalla."],
  ["Quando elementos interativos diferentes expõem descrições faladas idênticas, uma pessoa que usa leitor de tela pode ter dificuldade para distinguir o propósito ou o contexto de cada controle.", "When different interactive elements expose identical spoken descriptions, a screen reader user may have difficulty distinguishing the purpose or context of each control.", "Cuando diferentes elementos interactivos exponen descripciones habladas idénticas, una persona que usa lector de pantalla puede tener dificultades para distinguir el propósito o el contexto de cada control."],
  ["O relatório registra que vários itens têm a mesma descrição e que o texto falado “Plus Size” é idêntico ao de outro item. Não apresenta uma instrução de correção separada para esse achado.", "The report records that multiple items have the same description and that the spoken text “Plus Size” is identical to another item. It does not provide a separate correction instruction for this finding.", "El informe registra que varios elementos tienen la misma descripción y que el texto hablado “Plus Size” es idéntico al de otro elemento. No presenta una instrucción de corrección separada para este hallazgo."],
  ["Fornecer rótulos de acessibilidade contextualizados que descrevam o propósito de cada controle, como categoria ou acesso à coleção, de acordo com a ação realmente executada.", "Provide contextualized accessibility labels that describe the purpose of each control, such as a category or access to a collection, according to the action actually performed.", "Proporcionar etiquetas de accesibilidad contextualizadas que describan el propósito de cada control, como categoría o acceso a la colección, según la acción realmente realizada."],
  ["Evidência - descrição “Plus Size” repetida", "Evidence - repeated “Plus Size” description", "Evidencia - descripción “Plus Size” repetida"],
  ["A captura mostra duas ocorrências em contextos diferentes; o scanner confirma que itens clicáveis compartilham a mesma descrição falada.", "The screenshot shows two occurrences in different contexts; the scanner confirms that clickable items share the same spoken description.", "La captura muestra dos apariciones en contextos diferentes; el escáner confirma que los elementos clicables comparten la misma descripción hablada."],
  ["Texto e componentes com dimensões fixas", "Text and components with fixed dimensions", "Texto y componentes con dimensiones fijas"],
  ["Contêineres podem limitar a expansão do texto", "Containers may limit text expansion", "Los contenedores pueden limitar la expansión del texto"],
  ["O scanner encontrou elementos de texto e grupos com dimensões fixas que podem não acompanhar o aumento da fonte.", "The scanner found text elements and groups with fixed dimensions that may not accommodate an increased font size.", "El escáner encontró elementos de texto y grupos con dimensiones fijas que pueden no adaptarse al aumento del tamaño de fuente."],
  ["Dimensão fixa", "Fixed dimension", "Dimensión fija"],
  ["Layout adaptável", "Adaptive layout", "Diseño adaptable"],
  ["O scanner identificou componentes de texto e contêineres com dimensões fixas, o que pode limitar a expansão do conteúdo quando o tamanho da fonte é aumentado.", "The scanner identified text components and containers with fixed dimensions, which may limit content expansion when the font size is increased.", "El escáner identificó componentes de texto y contenedores con dimensiones fijas, lo que puede limitar la expansión del contenido cuando se aumenta el tamaño de fuente."],
  ["Pessoas que usam fontes maiores no sistema podem encontrar textos cortados, rótulos truncados, sobreposição ou perda de informação quando os contêineres não acompanham o conteúdo ampliado.", "People who use larger system fonts may encounter clipped text, truncated labels, overlap, or loss of information when containers do not adapt to enlarged content.", "Las personas que usan fuentes del sistema más grandes pueden encontrar texto recortado, etiquetas truncadas, superposición o pérdida de información cuando los contenedores no se adaptan al contenido ampliado."],
  ["Modificar os", "Modify the", "Modificar los"],
  ["para permitir a expansão do texto.", "to allow text expansion.", "para permitir la expansión del texto."],
  ["Evitar dimensões rígidas nos contêineres de texto, permitir que os componentes cresçam com o conteúdo e a escala de fonte do sistema e verificar a interface com tamanhos de fonte maiores no Android.", "Avoid rigid dimensions in text containers, allow components to grow with the content and system font scaling, and verify the interface with larger Android font sizes.", "Evitar dimensiones rígidas en los contenedores de texto, permitir que los componentes crezcan con el contenido y la escala de fuente del sistema y verificar la interfaz con tamaños de fuente mayores en Android."],
  ["Evidência - contêineres de texto com largura fixa", "Evidence - fixed-width text containers", "Evidencia - contenedores de texto con anchura fija"],
  ["O destaque identifica a faixa de categorias associada no relatório a grupos que podem limitar a expansão do texto.", "The highlight identifies the category strip associated in the report with groups that may limit text expansion.", "El resaltado identifica la franja de categorías asociada en el informe con grupos que pueden limitar la expansión del texto."],

  ["O texto destacado pelo scanner apresenta contraste inferior ao valor indicado para textos pequenos.", "The text highlighted by the scanner has a contrast ratio below the value indicated for small text.", "El texto resaltado por el escáner presenta un contraste inferior al valor indicado para textos pequeños."],
  ["O Scanner de Acessibilidade identificou contraste insuficiente entre o texto e o fundo. A relação estimada é de 2,91:1, entre", "The Accessibility Scanner identified insufficient contrast between the text and background. The estimated ratio is 2,91:1, between", "El Escáner de Accesibilidad identificó un contraste insuficiente entre el texto y el fondo. La relación estimada es de 2,91:1, entre"],
  [", abaixo dos 4,50:1 indicados pela ferramenta.", ", below the 4,50:1 indicated by the tool.", ", por debajo de los 4,50:1 indicados por la herramienta."],
  ["O baixo contraste pode dificultar a leitura para pessoas com baixa visão ou sensibilidade reduzida ao contraste, principalmente em telas pequenas ou ambientes muito iluminados.", "Low contrast can make reading difficult for people with low vision or reduced contrast sensitivity, especially on small screens or in very bright environments.", "El bajo contraste puede dificultar la lectura para personas con baja visión o sensibilidad reducida al contraste, especialmente en pantallas pequeñas o entornos muy iluminados."],
  ["Aumentar a taxa de contraste entre o primeiro plano e o plano de fundo do texto para 4,50:1 ou mais.", "Increase the contrast ratio between the text foreground and background to 4,50:1 or more.", "Aumentar la relación de contraste entre el primer plano y el fondo del texto a 4,50:1 o más."],
  ["Ajustar as cores do texto e/ou do fundo para aumentar o contraste visual e atingir pelo menos a relação recomendada pela ferramenta, preservando a hierarquia visual da interface.", "Adjust the text and/or background colors to increase visual contrast and reach at least the ratio recommended by the tool while preserving the interface's visual hierarchy.", "Ajustar los colores del texto y/o del fondo para aumentar el contraste visual y alcanzar por lo menos la relación recomendada por la herramienta, preservando la jerarquía visual de la interfaz."],
  ["Evidência - contraste de 2,91:1", "Evidence - 2,91:1 contrast", "Evidencia - contraste de 2,91:1"],
  ["A captura mostra o texto azul cujo contraste foi medido pela ferramenta.", "The screenshot shows the blue text whose contrast was measured by the tool.", "La captura muestra el texto azul cuyo contraste fue medido por la herramienta."],
  ["Texto oculto", "Hidden text", "Texto oculto"],
  ["Texto oculto para serviços de acessibilidade", "Text hidden from accessibility services", "Texto oculto para los servicios de accesibilidad"],
  ["Conteúdo textual relevante pode não estar sendo corretamente disponibilizado aos serviços de acessibilidade.", "Relevant text content may not be properly exposed to accessibility services.", "Es posible que el contenido textual relevante no se proporcione correctamente a los servicios de accesibilidad."],
  ["Serviços de acessibilidade", "Accessibility services", "Servicios de accesibilidad"],
  ["O Scanner detectou conteúdo textual que pode não estar sendo corretamente disponibilizado aos serviços de acessibilidade. Entre os textos identificados está “O prêmio semanal”.", "The Scanner detected text content that may not be properly exposed to accessibility services. The identified text includes “The weekly prize”.", "El Escáner detectó contenido textual que puede no estar disponible correctamente para los servicios de accesibilidad. Entre los textos identificados está “El premio semanal”."],
  ["Se o conteúdo visível não for corretamente exposto à árvore de acessibilidade, usuários de leitores de tela podem receber informações incompletas ou não compreender todo o conteúdo apresentado.", "If visible content is not properly exposed in the accessibility tree, screen reader users may receive incomplete information or may not understand all the content presented.", "Si el contenido visible no se expone correctamente en el árbol de accesibilidad, las personas que usan lectores de pantalla pueden recibir información incompleta o no comprender todo el contenido presentado."],
  ["O item pode não estar mostrando o conteúdo para os serviços de acessibilidade; o conteúdo relevante deve ser disponibilizado a esses serviços.", "The item may not be exposing its content to accessibility services; relevant content should be made available to those services.", "Es posible que el elemento no muestre el contenido a los servicios de accesibilidad; el contenido relevante debe ponerse a disposición de esos servicios."],
  ["Garantir que o conteúdo textual relevante seja corretamente exposto na árvore de acessibilidade e associado ao componente correspondente, permitindo que tecnologias assistivas transmitam a mesma informação apresentada visualmente.", "Ensure that relevant text content is properly exposed in the accessibility tree and associated with the corresponding component, allowing assistive technologies to convey the same information presented visually.", "Garantizar que el contenido textual relevante se exponga correctamente en el árbol de accesibilidad y se asocie con el componente correspondiente, permitiendo que las tecnologías de asistencia transmitan la misma información presentada visualmente."],
  ["Evidência - texto oculto", "Evidence - hidden text", "Evidencia - texto oculto"],
  ["O contorno do scanner abrange o cartão que inclui o texto “O prêmio semanal”.", "The scanner outline surrounds the card that includes the text “The weekly prize”.", "El contorno del escáner abarca la tarjeta que incluye el texto “El premio semanal”."],
  ["Itens clicáveis", "Clickable items", "Elementos clicables"],
  ["Itens clicáveis sobrepostos", "Overlapping clickable items", "Elementos clicables superpuestos"],
  ["Dois elementos clicáveis compartilham a mesma região da tela segundo o relatório do scanner.", "Two clickable elements share the same screen region according to the scanner report.", "Dos elementos clicables comparten la misma región de la pantalla según el informe del escáner."],
  ["2 elementos", "2 elements", "2 elementos"],
  ["Mesma área", "Same area", "Misma área"],
  ["O Scanner identificou elementos clicáveis diferentes compartilhando a região", "The Scanner identified different clickable elements sharing the region", "El Escáner identificó diferentes elementos clicables que comparten la región"],
  [", indicando sobreposição de áreas interativas.", ", indicating overlapping interactive areas.", ", lo que indica una superposición de áreas interactivas."],
  ["Áreas interativas sobrepostas podem tornar a navegação e a ativação de controles menos previsíveis, especialmente para usuários de tecnologias assistivas.", "Overlapping interactive areas can make navigation and control activation less predictable, especially for assistive technology users.", "Las áreas interactivas superpuestas pueden hacer que la navegación y la activación de controles sean menos predecibles, especialmente para las personas usuarias de tecnologías de asistencia."],
  ["Vários itens clicáveis compartilham este local na tela. O item tem a mesma região que outro elemento conflitante.", "Multiple clickable items share this location on the screen. The item has the same region as another conflicting element.", "Varios elementos clicables comparten esta ubicación en la pantalla. El elemento tiene la misma región que otro elemento en conflicto."],
  ["Revisar a estrutura dos componentes interativos para evitar áreas clicáveis duplicadas ou sobrepostas e garantir que cada ação tenha uma região de interação claramente definida.", "Review the structure of interactive components to avoid duplicate or overlapping clickable areas and ensure that each action has a clearly defined interaction region.", "Revisar la estructura de los componentes interactivos para evitar áreas clicables duplicadas o superpuestas y garantizar que cada acción tenga una región de interacción claramente definida."],
  ["Evidência - itens clicáveis sobrepostos", "Evidence - overlapping clickable items", "Evidencia - elementos clicables superpuestos"],
  ["O contorno marca a região compartilhada por dois elementos clicáveis.", "The outline marks the region shared by two clickable elements.", "El contorno marca la región compartida por dos elementos clicables."],

  ["Síntese da análise", "Analysis summary", "Síntesis del análisis"],
  ["Achados nos três aplicativos", "Findings across the three applications", "Hallazgos en las tres aplicaciones"],
  ["Uma visão geral das barreiras confirmadas nos relatórios do Scanner de Acessibilidade.", "An overview of the barriers confirmed in the Accessibility Scanner reports.", "Una visión general de las barreras confirmadas en los informes del Escáner de Accesibilidad."],
  ["Interação e compreensão", "Interaction and understanding", "Interacción y comprensión"],
  ["Foram registrados problemas de área de toque, contraste do texto e descrições de acessibilidade repetidas.", "Touch-target, text-contrast, and repeated accessibility-description problems were recorded.", "Se registraron problemas de área táctil, contraste del texto y descripciones de accesibilidad repetidas."],
  ["Ver estudos da Uber", "View Uber studies", "Ver estudios de Uber"],
  ["Interação, descrição e adaptação", "Interaction, description, and adaptation", "Interacción, descripción y adaptación"],
  ["Foram registrados alvos de toque pequenos, descrições faladas repetidas e componentes com dimensões fixas que podem limitar a expansão do texto.", "Small touch targets, repeated spoken descriptions, and fixed-dimension components that may limit text expansion were recorded.", "Se registraron objetivos táctiles pequeños, descripciones habladas repetidas y componentes con dimensiones fijas que pueden limitar la expansión del texto."],
  ["Ver estudos da SHEIN", "View SHEIN studies", "Ver estudios de SHEIN"],
  ["Conteúdo e interação", "Content and interaction", "Contenido e interacción"],
  ["Foram registrados baixo contraste, conteúdo possivelmente indisponível aos serviços de acessibilidade e itens clicáveis sobrepostos.", "Low contrast, content potentially unavailable to accessibility services, and overlapping clickable items were recorded.", "Se registraron bajo contraste, contenido posiblemente no disponible para los servicios de accesibilidad y elementos clicables superpuestos."],
  ["Ver estudos da Google Play Store", "View Google Play Store studies", "Ver estudios de Google Play Store"],
  ["Conclusão", "Conclusion", "Conclusión"],
  ["Acessibilidade se constrói nos detalhes", "Accessibility is built in the details", "La accesibilidad se construye en los detalles"],
  ["A análise demonstrou que pequenos detalhes de interface podem criar barreiras significativas de acessibilidade. Ferramentas como o Scanner de Acessibilidade ajudam a identificar esses problemas e fornecem recomendações que podem tornar os aplicativos mais inclusivos, compreensíveis e fáceis de utilizar.", "The analysis showed that small interface details can create significant accessibility barriers. Tools such as the Accessibility Scanner help identify these problems and provide recommendations that can make applications more inclusive, understandable, and easy to use.", "El análisis demostró que pequeños detalles de la interfaz pueden crear barreras significativas de accesibilidad. Herramientas como el Escáner de Accesibilidad ayudan a identificar estos problemas y ofrecen recomendaciones que pueden hacer que las aplicaciones sean más inclusivas, comprensibles y fáciles de usar."],
  ["Identificar barreiras é o primeiro passo para criar experiências mais inclusivas.", "Identifying barriers is the first step toward creating more inclusive experiences.", "Identificar barreras es el primer paso para crear experiencias más inclusivas."],
  ["Ferramentas automatizadas orientam a análise, mas não substituem testes com pessoas.", "Automated tools guide the analysis but do not replace testing with people.", "Las herramientas automatizadas orientan el análisis, pero no sustituyen las pruebas con personas."],
  ["Análise de Acessibilidade em Aplicativos - 2026", "Accessibility Analysis in Applications - 2026", "Análisis de Accesibilidad en Aplicaciones - 2026"],
  ["Desenvolvido para fins acadêmicos.", "Developed for academic purposes.", "Desarrollado con fines académicos."],
  ["Apresentação ·", "Presentation ·", "Presentación ·"],
  ["19/08/2026", "08/19/2026", "19/08/2026"],
  ["Visualização em tela cheia", "Full-screen view", "Vista en pantalla completa"],
  ["Fechar", "Close", "Cerrar"],
  ["Fechar visualização em tela cheia", "Close full-screen view", "Cerrar vista en pantalla completa"],
  ["Voltar ao topo da página", "Return to the top of the page", "Volver al inicio de la página"],
  ["Falha ao iniciar a página:", "Failed to initialize the page:", "No se pudo iniciar la página:"],

  ["Retrato de Andreia em enquadramento próximo. Ela aparece de frente para a câmera, com cabelos longos, escuros e cacheados, distribuídos ao redor do rosto e sobre os ombros. Usa uma blusa preta de decote em V e um colar com pequeno pingente. A expressão é neutra, com os olhos direcionados para a câmera, diante de um fundo claro e discreto.", "Close-up portrait of Andreia. She faces the camera with long, dark, curly hair arranged around her face and over her shoulders. She wears a black V-neck blouse and a necklace with a small pendant. Her expression is neutral, with her eyes directed at the camera, against a light, understated background.", "Retrato cercano de Andreia. Aparece de frente a la cámara, con el cabello largo, oscuro y rizado, distribuido alrededor del rostro y sobre los hombros. Lleva una blusa negra con escote en V y un collar con un pequeño colgante. Su expresión es neutra, con la mirada dirigida a la cámara, ante un fondo claro y discreto."],
  ["Foto de Israel em ambiente externo, enquadrado dos ombros para cima e olhando diretamente para a câmera. Ele tem cabelos escuros, volumosos e ondulados, com mechas caindo sobre a testa, e usa um fone de ouvido. Veste uma camiseta marrom, mochila e um cordão de identificação verde e branco. Ao fundo aparecem árvores, calçada, muro, rua e veículos.", "Photo of Israel outdoors, framed from the shoulders up and looking directly at the camera. He has dark, voluminous, wavy hair, with strands falling over his forehead, and wears an earbud. He is wearing a brown T-shirt, a backpack, and a green-and-white identification lanyard. Trees, a sidewalk, a wall, a street, and vehicles appear in the background.", "Foto de Israel al aire libre, encuadrado desde los hombros y mirando directamente a la cámara. Tiene el cabello oscuro, voluminoso y ondulado, con mechones sobre la frente, y usa un auricular. Lleva una camiseta marrón, una mochila y un cordón de identificación verde y blanco. Al fondo aparecen árboles, acera, muro, calle y vehículos."],
  ["Foto de Kelly sentada em uma cadeira durante um evento, olhando para a câmera e sorrindo levemente. Ela tem cabelos longos, lisos e escuros, repartidos ao centro e posicionados sobre os ombros. Usa vestido preto com detalhes de renda, brincos prateados e um colar delicado. Ao fundo aparecem mesas, cadeiras brancas, outras pessoas e iluminação quente de ambiente interno.", "Photo of Kelly seated in a chair during an event, looking at the camera and smiling slightly. She has long, straight, dark hair, parted in the middle and resting over her shoulders. She wears a black dress with lace details, silver earrings, and a delicate necklace. Tables, white chairs, other people, and warm indoor lighting appear in the background.", "Foto de Kelly sentada en una silla durante un evento, mirando a la cámara y sonriendo levemente. Tiene el cabello largo, liso y oscuro, partido al centro y sobre los hombros. Lleva un vestido negro con detalles de encaje, pendientes plateados y un collar delicado. Al fondo aparecen mesas, sillas blancas, otras personas e iluminación cálida de interior."],
  ["Foto de Murilo dentro de um ônibus, enquadrado do peito para cima e olhando para a câmera. Ele tem cabelos curtos, escuros e cacheados e veste uma camisa verde. Uma das mãos aparece em primeiro plano fazendo sinal de positivo com o polegar. Ao fundo são visíveis bancos azuis, janelas e estruturas internas amarelas do ônibus.", "Photo of Murilo inside a bus, framed from the chest up and looking at the camera. He has short, dark, curly hair and wears a green shirt. One hand appears in the foreground giving a thumbs-up. Blue seats, windows, and yellow interior structures of the bus are visible in the background.", "Foto de Murilo dentro de un autobús, encuadrado desde el pecho y mirando a la cámara. Tiene el cabello corto, oscuro y rizado y lleva una camisa verde. Una mano aparece en primer plano haciendo una señal positiva con el pulgar. Al fondo se ven asientos azules, ventanas y estructuras interiores amarillas del autobús."],

  ["Tela da seção Conta da Uber. Contornos laranja do Scanner de Acessibilidade destacam os controles 4,96 e Não verificado, identificados como alvos clicáveis com apenas 18dp de altura.", "Uber Account screen. Orange Accessibility Scanner outlines highlight the 4,96 and Not verified controls, identified as clickable targets only 18dp high.", "Pantalla Cuenta de Uber. Los contornos naranjas del Escáner de Accesibilidad resaltan los controles 4,96 y No verificado, identificados como objetivos clicables de solo 18dp de altura."],
  ["Tela inicial da Uber. Contornos laranja do Scanner de Acessibilidade destacam as etiquetas promocionais 10-30%, Promo e Novo, cujo contraste entre texto e fundo foi medido em 3,42:1.", "Uber home screen. Orange Accessibility Scanner outlines highlight the 10-30%, Promo, and New promotional labels, whose text-to-background contrast was measured at 3,42:1.", "Pantalla de inicio de Uber. Los contornos naranjas del Escáner de Accesibilidad resaltan las etiquetas promocionales 10-30%, Promo y Nuevo, cuyo contraste entre texto y fondo se midió en 3,42:1."],
  ["Caixa de entrada da Uber. Contornos laranja do Scanner de Acessibilidade destacam os controles Agendar e Detalhes da primeira oferta; os mesmos rótulos são usados novamente na oferta seguinte.", "Uber inbox. Orange Accessibility Scanner outlines highlight the Schedule and Details controls for the first offer; the same labels are used again for the next offer.", "Bandeja de entrada de Uber. Los contornos naranjas del Escáner de Accesibilidad resaltan los controles Programar y Detalles de la primera oferta; las mismas etiquetas vuelven a utilizarse en la oferta siguiente."],
  ["Tela inicial da SHEIN analisada pelo Scanner de Acessibilidade. Os controles clicáveis da barra superior e das categorias estão contornados; entre os alvos pequenos identificados há controles de 36dp por 40dp e categorias com cerca de 38dp de altura.", "SHEIN home screen analyzed by the Accessibility Scanner. Clickable controls in the top bar and categories are outlined; the identified small targets include 36dp by 40dp controls and categories about 38dp high.", "Pantalla de inicio de SHEIN analizada por el Escáner de Accesibilidad. Los controles clicables de la barra superior y las categorías están contorneados; entre los objetivos pequeños identificados hay controles de 36dp por 40dp y categorías de aproximadamente 38dp de altura."],
  ["Tela inicial da SHEIN analisada pelo Scanner de Acessibilidade. Dois controles clicáveis com o texto Plus Size aparecem em áreas diferentes da tela e são destacados como apoio visual ao achado de descrições faladas idênticas.", "SHEIN home screen analyzed by the Accessibility Scanner. Two clickable controls with the text Plus Size appear in different areas of the screen and are highlighted as visual support for the finding of identical spoken descriptions.", "Pantalla de inicio de SHEIN analizada por el Escáner de Accesibilidad. Dos controles clicables con el texto Plus Size aparecen en áreas diferentes de la pantalla y se resaltan como apoyo visual al hallazgo de descripciones habladas idénticas."],
  ["Tela inicial da SHEIN analisada pelo Scanner de Acessibilidade. A faixa horizontal de categorias, com textos como Masculino, Envio Nacional, Feminino e Esporte, é destacada como região com contêineres de largura fixa que podem limitar a expansão do texto.", "SHEIN home screen analyzed by the Accessibility Scanner. The horizontal category strip, with text such as Men, National Shipping, Women, and Sports, is highlighted as a region with fixed-width containers that may limit text expansion.", "Pantalla de inicio de SHEIN analizada por el Escáner de Accesibilidad. La franja horizontal de categorías, con textos como Masculino, Envío Nacional, Femenino y Deporte, se resalta como una región con contenedores de anchura fija que pueden limitar la expansión del texto."],
  ["Menu da conta na Google Play Store analisado pelo Scanner de Acessibilidade. O texto azul Gerenciar sua Conta do Google aparece sobre fundo cinza e apresentou contraste de 2,91:1.", "Google Play Store account menu analyzed by the Accessibility Scanner. The blue Manage your Google Account text appears on a gray background and had a contrast ratio of 2,91:1.", "Menú de la cuenta de Google Play Store analizado por el Escáner de Accesibilidad. El texto azul Gestionar tu cuenta de Google aparece sobre un fondo gris y presentó un contraste de 2,91:1."],
  ["Tela Para você da Google Play Store. Um contorno laranja do Scanner de Acessibilidade abrange o cartão com o texto O prêmio semanal, que pode não estar disponível aos serviços de acessibilidade.", "Google Play Store For you screen. An orange Accessibility Scanner outline surrounds the card with the text The weekly prize, which may not be available to accessibility services.", "Pantalla Para ti de Google Play Store. Un contorno naranja del Escáner de Accesibilidad abarca la tarjeta con el texto El premio semanal, que puede no estar disponible para los servicios de accesibilidad."],
  ["Tela de pesquisa da Google Play Store analisada pelo Scanner de Acessibilidade. Na região superior direita, dois elementos clicáveis compartilham a mesma área de interação, causando sobreposição.", "Google Play Store search screen analyzed by the Accessibility Scanner. In the upper-right region, two clickable elements share the same interaction area, causing overlap.", "Pantalla de búsqueda de Google Play Store analizada por el Escáner de Accesibilidad. En la región superior derecha, dos elementos clicables comparten la misma área de interacción, lo que causa una superposición."],

  ["Comparação entre a altura detectada e a recomendada", "Comparison between the detected and recommended height", "Comparación entre la altura detectada y la recomendada"],
  ["Comparação entre o contraste detectado e o recomendado para textos pequenos", "Comparison between the detected and recommended contrast for small text", "Comparación entre el contraste detectado y el recomendado para textos pequeños"],
  ["Textos falados repetidos identificados pelo Scanner", "Repeated spoken text identified by the Scanner", "Textos hablados repetidos identificados por el Escáner"],
  ["Comparação entre o tamanho detectado e a área de toque recomendada", "Comparison between the detected size and recommended touch target", "Comparación entre el tamaño detectado y el área táctil recomendada"],
  ["Descrição repetida e item identificado pelo scanner", "Repeated description and item identified by the scanner", "Descripción repetida y elemento identificado por el escáner"],
  ["Comportamento detectado e comportamento recomendado para expansão do texto", "Detected and recommended behavior for text expansion", "Comportamiento detectado y recomendado para la expansión del texto"],
  ["Resumo do achado de texto oculto", "Summary of the hidden-text finding", "Resumen del hallazgo de texto oculto"],
  ["Resumo dos itens clicáveis sobrepostos", "Summary of overlapping clickable items", "Resumen de los elementos clicables superpuestos"],
  ["Ampliar evidência do Bug 01 da Uber", "Enlarge evidence for Uber Bug 01", "Ampliar evidencia del Error 01 de Uber"],
  ["Ampliar evidência do Bug 02 da Uber", "Enlarge evidence for Uber Bug 02", "Ampliar evidencia del Error 02 de Uber"],
  ["Ampliar evidência do Bug 03 da Uber", "Enlarge evidence for Uber Bug 03", "Ampliar evidencia del Error 03 de Uber"],
  ["Ampliar evidência do Bug 01 da SHEIN", "Enlarge evidence for SHEIN Bug 01", "Ampliar evidencia del Error 01 de SHEIN"],
  ["Ampliar evidência do Bug 02 da SHEIN", "Enlarge evidence for SHEIN Bug 02", "Ampliar evidencia del Error 02 de SHEIN"],
  ["Ampliar evidência do Bug 03 da SHEIN", "Enlarge evidence for SHEIN Bug 03", "Ampliar evidencia del Error 03 de SHEIN"],
  ["Ampliar evidência do Bug 01 da Google Play Store", "Enlarge evidence for Google Play Store Bug 01", "Ampliar evidencia del Error 01 de Google Play Store"],
  ["Ampliar evidência do Bug 02 da Google Play Store", "Enlarge evidence for Google Play Store Bug 02", "Ampliar evidencia del Error 02 de Google Play Store"],
  ["Ampliar evidência do Bug 03 da Google Play Store", "Enlarge evidence for Google Play Store Bug 03", "Ampliar evidencia del Error 03 de Google Play Store"],
];

const dictionaries = { en: Object.create(null), es: Object.create(null) };
TRANSLATION_ROWS.forEach(([source, english, spanish]) => {
  dictionaries.en[source] = english;
  dictionaries.es[source] = spanish;
});

const dynamicMessages = {
  "pt-BR": { __text_size: "Tamanho do texto: {label}.", __setting_state: "{label} {state}." },
  en: { __text_size: "Text size: {label}.", __setting_state: "{label} {state}." },
  es: { __text_size: "Tamaño del texto: {label}.", __setting_state: "{label} {state}." },
};

let currentLanguage = DEFAULT_LANGUAGE;
let pickerInitialized = false;

function interpolate(message, variables = {}) {
  return message.replace(/\{(\w+)\}/g, (_, key) => String(variables[key] ?? `{${key}}`));
}

function translated(source, language = currentLanguage) {
  if (language === DEFAULT_LANGUAGE) return source;
  return dictionaries[language]?.[source] ?? source;
}

export function t(source, variables) {
  return interpolate(dynamicMessages[currentLanguage]?.[source] ?? translated(source), variables);
}

function captureDocumentContent() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim() || node.parentElement?.closest("script, style, noscript")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node = walker.nextNode();
  while (node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    node = walker.nextNode();
  }

  document.querySelectorAll("[alt], [aria-label], [title], [placeholder]").forEach((element) => {
    if (originalAttributes.has(element)) return;
    const values = {};
    ["alt", "aria-label", "title", "placeholder"].forEach((attribute) => {
      if (element.hasAttribute(attribute)) values[attribute] = element.getAttribute(attribute);
    });
    originalAttributes.set(element, values);
  });
}

function localizeDocument(language) {
  captureDocumentContent();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => originalText.has(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  let node = walker.nextNode();
  while (node) {
    const original = originalText.get(node);
    const source = original.trim();
    node.nodeValue = original.replace(source, translated(source, language));
    node = walker.nextNode();
  }

  document.querySelectorAll("[alt], [aria-label], [title], [placeholder]").forEach((element) => {
    const values = originalAttributes.get(element);
    if (!values) return;
    Object.entries(values).forEach(([attribute, source]) => element.setAttribute(attribute, translated(source, language)));
  });

  document.documentElement.lang = language;
  const titleElement = document.querySelector("title");
  const titleLanguage = language === DEFAULT_LANGUAGE ? "pt" : language;
  document.title = titleElement?.getAttribute(`data-title-${titleLanguage}`)
    || translated("Acesso em Foco - Análise de Acessibilidade", language);
  document.querySelector('meta[name="description"]')?.setAttribute("content", translated("Apresentação acadêmica sobre análise de acessibilidade em aplicativos móveis com ferramentas de inspeção de acessibilidade.", language));
}

function updatePicker(language) {
  const trigger = document.querySelector("#language-toggle");
  const menu = document.querySelector("#language-menu");
  const current = document.querySelector("#language-current");
  if (!trigger || !menu || !current) return;
  trigger.setAttribute("aria-label", translated("Selecionar idioma", language));
  menu.setAttribute("aria-label", translated("Selecionar idioma", language));
  current.textContent = LANGUAGE_CODES[language];
  menu.querySelectorAll("[data-language]").forEach((option) => option.setAttribute("aria-checked", String(option.dataset.language === language)));
}

function loadLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function persistLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.warn("Language preference could not be saved.", error);
  }
}

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(language, { persist = true, notify = true } = {}) {
  const nextLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  const scrollPosition = window.scrollY;
  currentLanguage = nextLanguage;
  localizeDocument(nextLanguage);
  updatePicker(nextLanguage);
  if (persist) persistLanguage(nextLanguage);
  if (notify) listeners.forEach((listener) => listener(nextLanguage));
  if (scrollPosition > 0) {
    window.scrollTo(0, scrollPosition);
    window.siteLenis?.resize?.();
    window.siteLenis?.scrollTo?.(scrollPosition, { immediate: true, force: true });
  }
  document.documentElement.classList.remove("i18n-pending");
}

export function onLanguageChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setupLanguagePicker() {
  if (pickerInitialized) return;
  const trigger = document.querySelector("#language-toggle");
  const menu = document.querySelector("#language-menu");
  if (!trigger || !menu) return;
  pickerInitialized = true;
  const options = [...menu.querySelectorAll("[data-language]")];

  const closeMenu = ({ restoreFocus = false } = {}) => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  };
  const openMenu = () => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    (options.find((option) => option.dataset.language === currentLanguage) ?? options[0])?.focus();
  };

  trigger.addEventListener("click", () => menu.hidden ? openMenu() : closeMenu({ restoreFocus: true }));
  trigger.addEventListener("keydown", (event) => {
    if (!["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    if (menu.hidden) openMenu();
    else if (["Enter", " "].includes(event.key)) closeMenu({ restoreFocus: true });
  });
  options.forEach((option) => {
    option.addEventListener("click", () => {
      setLanguage(option.dataset.language);
      closeMenu({ restoreFocus: true });
    });
  });
  menu.addEventListener("keydown", (event) => {
    const activeIndex = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }
    if (event.key === "Tab") {
      closeMenu();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = activeIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "ArrowDown") nextIndex = (activeIndex + 1 + options.length) % options.length;
    else nextIndex = (activeIndex - 1 + options.length) % options.length;
    options[nextIndex].focus();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!menu.hidden && !event.target.closest(".language-picker")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });
}

export function setupI18n() {
  captureDocumentContent();
  setupLanguagePicker();
  setLanguage(loadLanguage(), { persist: false, notify: true });
}
