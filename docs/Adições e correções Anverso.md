### **Correções e implementações**

* Fazer botão de compartilhamento de perfil funcionar (/explore/id)  
* Melhorar sistema de filtros e pesquisa  
* Adicionar suporte para comentários externos de contas do qual o trabalho foi compartilhado com  
* verificação de perfil de professor  
* Alterar o nome dashboard era provisório e fica pouco amigavel  
* Consertar acesso publico ao explore e sistema de autenticação e redirecionamento  
* em filtros ordenar por as opções quebrar o container  
* /explore ainda não reflete nome e fotos reais do usuario para cada projeto  
* contagem de usos do perfil não está funcionando  
* sistema de armazenamento de fotos e imagens está quebrado/quebrando com facilidade  
* no /explore/id tirar a seção o que está incluido e mover para detalhes do perfil detalhando de forma real e amigavel o que está explicito em cada formatação e estilos  
* melhorar as estatisticas do painel de administrador pra exibirem informações reais e mais relevantes

Criador de perfis

* Essa pagina se chamará criador de perfil, remover referências a builder é estrangeirismo e a plataforma é brasileira  
* Ao selecionar um tamanho de folha existente ex. A4, Oficio os campos largura e altura não devem ser exibidos  
* a seção familias de fonte é esquisita e não deve ser definida aqui o que deve ser definido é qual a fonte padrão e quais são as opcionais se houverem, essa lista de nomes de estilos em checkboxes é uma decisão horrivel e deve ser retirada  
* a numeração das paginas deve ser movida para depois da definição dos componentes assim o usuario já sabe o que criou e naturalmente sabe onde a paginação deve começar  
* A aba de seções do documento deve ser adaptada para o novo contexto de descriptions e placeholders criados no formatter-service  
* nos slots temos Nome do estilo isso é algo completamente incorreto o usuario não deve ter poder de definir algo assim além do mais isso é só um nome mascarado para o usuario definir o id do estilo e o usuario não deve definir ids  
* nos slots o campo Família de fonte  deveria se chamar Fonte e o usuario deveria ter a opção de usar a Padrão definida na aba Pagina ou alguma outra no dropdown, por padrão viria selecionado a fonte padrão  
* Alguns tipos de componentes simplesmente não dá pra compreender a configuração como referencias não dá pra entender o que são partes, não ocorre explicação alguma   
* Campos automáticos ou sem slots configuraveis deveriam ou conter explicações na coluna central ou mover as configurações pra lá removendo a coluna da direita  
* Componentes do tipo pagina unica e texto livre deveriam conter muito mais explicações sobre o que é cada coisa e o que cada configuração faz no elemento e no componente  
* Não é possivel mudar o tipo do componente após ele criado, deveria ser possivel alterar e abrir um modal de confirmação informando que ao confirmar a alteração os slots já criados podem ser afetados  
* Slots pertencentes a componentes de pagina unica o campo Agrupar com outros campos deveria ser mais amigavel talvez exibindo o nome dos outros slots e o usuario selecionar quais ele deseja agrupar e seguido de uma explicação do que significa isso deixe a logica de ids e criar o agrupamento por baixo dos panos  
* Por algum motivo alguns titulos e campos que usam acentuação estão quebrando e substituindo a letra e acento por ??  
* A aba Elementos Textuais, por algum motivo eles estão com 2 visualizações, a coluna está contida na largura o que dificulta a visualização de algumas informações e faltam configurações de posicionamento, por exemplo se eu quiser titulo,fonte e imagem ou titulo, imagem, fonte não tem onde configurar isso, deve ser ajustado para todos  
* faltam explicações pra campos de tipos de citações, notas de rodapé, codigo, tabelas, figuras e imagens  
* em pós processamento temos um campo Estilo do rótulo  que é completamente desnecessario e um Verificação de integridade que não existe no formatter-service  
* o sistema aponta quantidade de problemas no perfil mas não diz quais são e onde são


Criador de trabalhos

* o tamanho do criador está limitado horizontalmente, deveria ser mais como o criador de perfis  
* a função de sincronizar campos repetidos está meio quebrada e copia textos para campos que não necessariamente são a mesma coisa  
* o criador de trabalhos deve ser readaptado para os novos campos de descrição e placeholder do profile, além da inserção de componentes obrigatorios ou não agora virem do profile e não mais uma suposição do frontend  
* Alguns componentes ainda estão meio quebrados para preencher, por exemplo selecionando o perfil abnt-unip em referencias bibliograficas tem apenas o campo Itens  que certamente é insuficiente para essa categoria, o mesmo se repete em outros campos sendo interpretados de forma errada pelo frontend  
* devemos padronizar o sistema de compartilhamento para ficar igual ao compartilhamento de perfil  
* Ao compartilhar o trabalho em desenvolvimento com outros usuarios o sistema deve permitir que eles acessem o trabalho e façam comentarios sobre como seções e elementos, os comentarios ficam vinculados a o que o usuario está comentando  
* melhorar o sistema de salvamento de trabalhos que atualmente “pisca” da primeira vez que salvamos  
* Em elementos com itens seccionados melhorar a visualização das seções e garantir que niveis muito altos de titulo como um titulo 6 ainda seja bem visivel e trabalhavel  
* melhorar a ui desses itens seccionados também, atualmente estão bem feios

