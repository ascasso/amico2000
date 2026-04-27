# Testo estratto - Sperimentare 1980 05 supplemento

Testo estratto automaticamente dal livello OCR del PDF locale. Il testo è conservato in italiano; le pagine senza testo OCR sono lasciate vuote.

## Pagina PDF 1

```text

```

## Pagina PDF 2

```text

```

## Pagina PDF 3

```text
     Giovanni Ghiringhelli e Giuseppe Fusaroli




   costruiamo un vero
 microelaboratore
 •
   elettronico
     •
e 1mpar1amo a programmare




             JACOPO CASTELFRANCHI EDITORE
       Via dei Lavoratori, 124 - 20092 Cinisello Balsamo
```

## Pagina PDF 4

```text
SPERIMENT~RE

Rivista mensile di elettronica pratica; Editore: J.C.E. - Direttore responsabile: RUBEN CASTELFRANCHI -
Capo redattore: GIAMPIETRO ZANGA - Vice capo redattore: GIANNI DE TOMASI - Redazione: SERGIO
CIRIMBELLI, DANIELE FUMAGALLI, TULLIO LACCHINI, MARTA MENEGARDO - Grafica e impaginazione:                •             JACOPO CASTELFRANCHI EDITORE
MARCELLO LONGHINI - Laboratorio: ANGELO CATIANEO, LORENZO BARRILE - Contabilità: ROBERTO
OSTELLI, M. GRAZIA SEBASTIANI - Diffusione e abbonamenti: PATRIZIA GHIGNI - Collaboratori LUCIO
VISINTINI, FILIPPO PIPITONE, LUCIO BIANCOLI, FEDERICO CANCARINI, LODOVICO CASCIANINI, SANDRO
GRISOSTOLO, GIOVANNI GIORGINI, ADRIANO ORTILE, AMADIO GOZZI, PIERANGELO PENSA, GIUSEPPE                       © Tutti i diritti di riproduzione e traduzione
CONTARDI - Direzione, Redazione: Via dei Lavoratori, 124; 20092 Cinisello Balsamo - Milano. Telefono
6172671 - 6172641. - Amministrazione: Via Vincenzo Monti, 15 - 20123 Milano. - Autorizzazione alla            degli articoli pubblicati sono riservati.
                                                                                                              ~ Mensile associato all'USPI
pubblicazione: Tribunale di Monza, numero 258 del 28-11-197 4. - Stamp'a: Tipo-Lito Elcograf s.p.a.
22050 Beverale (Como). - Concessionario esclusivo per la diffusione in Italia e all'Estero SODIP - Via
Zuretti, 25 - 20125 Milano; SODIP - Via Serpieri, 11 /5 - 00197 Roma. - Spedizione in abbonamento             ~ Unione Stampa Periodica Italiana
postale gruppo 111/70.
```

## Pagina PDF 5

```text
PREFAZIONE
   Questo libro vuole essere un contributo al passaggio dal/' "era dei cervelli
elettronici" a quella degli elaboratori elettronici.
   Questo trattato sul microelaboratore infatti è il frutto del lavoro di un gruppo di
esperti italiani nel campo della divulgazione tecnica e della progettazione con i
dispositivi elettronici che saranno i protagonisti della nostra vita di domani:
 i MICROPROCESSORI.
   Con un taglio indirizzato specialmente a chi deve partire da zero si è voluto
sfatare una volta per tutte il mito del "troppo difficile", del "queste sono cose
per i soli addetti ai lavori" con una trattazione completa, giustamente approfon-
dita, ma soprattutto facile da capire, divertente e, perchè no, entusiasmante an-
che perchè collegata alla costruzione di un vero e proprio microelaboratore elet-
tronico sul quale verificare in pratica le nozioni apprese.
   Ma tutto questo non toglie che anche l'esperto in elettronica non possa trova-
re in queste pagine la chiave per comprendere con naturalezza la filosofia dei
moderni microelaboratori e imparare a programmare quasi senza accorgersene.
E questa è una cosa positiva, più che positiva: troppo spesso si è accomunato il
"tecnologicamente avanzato" con il "difficile", quasi che argomenti importanti
come il microprocessore e la programmazione conservino il loro prestigio pro-
fessionale solo se spiegati /n maniera comprensibile a pochi.


La giusta prospettiva

   La giusta prospettiva, il giusto punto di vista dal quale si è partiti è in sostan-
za la chiave della semplicità, vorremmo ribattere della naturalezza con la quale il
lettore assimila passo dopo passo la filosofia del microelaboratore imparando a
capirlo e a saperlo usare.
   Solo un paragone. Vi è mai capitato di trovarvi ad osservare una immagine tal-
mente da vicino che anche il particolare più definito non è altro che una mac-
chia, un insieme di chiaroscuri senza significato. Certo che se in queste condi-
zioni si vuole capire il significato di quella immagine, ciò che essa rappresenta,
quello è senz'altro il punto di vista meno adatto.
   Così per il microprocessore partire dal dettaglio infinitesimo, dal particolare
squisitamente tecnico può essere un grosso errore tale da scoraggiare i più.
   Ma se ci si allontana da quella immagine per vederla prima nel suo insieme,
per capire la sua forma, la sua struttura globale, ecco che quelle macchie senza
significato cominciano a prendere forma, ad assumere la loro posizione logica in
un contesto che finirà per diventarci familiare. Vogliamo dire che il microelabora-
tore, il computer, se presentato da una giusta prospettiva non può essere non
capito: siamo convinti che l'opera di un uomo non può non essere compresa da
qualsiasi altro uomo, la chiave sta nel giusto meccanismo del trasferimento delle
informazioni.

   l'lng. Giovanni Ghiringhelli e il Sig. Giuseppe Fusaroli, autori della trattazione,
ringraziano il Sig. Giampietro Zanga, Direttore della Casa Editrice JCE, per aver
creduto nell'iniziativa e per aver incoraggiato questo lavoro che si augurano
possa incontrare il favore dei lettori.
   Un particolare ringraziamento va anche al Sig. Marcello Marongiu per la con-
sulenza prestata nella redazione dei testi e al Prof. Angelo Bressan e al Sig.
Piero Dell'Orco per il contributo ai programmi applicativi riportati in appendice.
```

## Pagina PDF 6

```text

```

## Pagina PDF 7

```text
                                SOMMARIO

PREFAZIONE ........................................................... .      pag.     5
CAPITOLO I - Cosa è un microelaboratore ............................. .         ))
                                                                                       9
   Cosa fare con un computer: il limite è la fantasia .................. .      ))    10
   Come è composto i'AMiCO 2000 ................................... .           ))    10
   Struttura di un microelaboratore .................................... .      .))
                                                                                      10
   Come funziona un microelaboratore ................................ .         ))    11
   Dal codice binario al codice esadecimale .......................... .        ))    12
   Movimento e controllo dei dati in un microprocessore a 8 bit ...... .        ))    13

CAPITOLO Il - Il linguaggio del microelaboratore ...................... .       ))    15
   Cosa è un programma ............................................. .          ))    15
   Il microelaboratore e il suo linguaggio ............................. .      ))
                                                                                      15
   Un esempio pratico ................................................ .        ))
                                                                                      15
   Il program counter ................................................. .       ))    18
   Le istruzioni esaminate ............................................. .      ))    19
   Alcuni dettagli sulla CPU ........................................... .      ))    19

CAPITOLO lii - Montaggio e collaudo del microelaboratore ............ .         »     21
   L'architettura dell'AMICO 2000A .................................... .       ))
                                                                                      21
   Il montaggio ......... '.............................................. .     ))    22
   L'assemblaggio ..................................................... .       ))
                                                                                      22
   Un primo collaudo ..................................................·        ))
                                                                                      24
   Completamento del montaggio ..................................... .          ))    24
   Introduciamo un primo programma ................................. .          ))    27
   L'esecuzione del programma ....................................... .          ))
                                                                                      29
   Un programma più complesso: "Il gioco dei riflessi" ................ .        ))
                                                                                      30

CAPITOLO IV - Il sistema di indirizzamento ............................ .        ))
                                                                                      35
   La somma nel sistema binario ..................................... .          ))
                                                                                      35
   Esercizio con i'AMiCO 2000 ........................................ .         ))
                                                                                      36
   Somma esadecimale e somma decimale ........................... .              ))
                                                                                      37
   La "pagina zero" .............. , .................................... .      ))   37
   Il metodo di indirizzamento ......................................... .       ))
                                                                                      39
   Approfondimento hardware: il clock ................................ .         ))
                                                                                      39
   Suddivisione dell'AMICO 2000 ...................................... .         ))
                                                                                      40
   Applicazione ....................................................... .        ))
                                                                                      40
```

## Pagina PDF 8

```text
CAPITOLO V - L'uso del registratore a cassette ....................... .        ))
                                                                                     43
   L'interfaccia per il registratore ...................................... .   ))
                                                                                     43
  _Il montaggio ....................................................... .       ))
                                                                                     43
   l'utilizzo del registratore e suo collegamento ....................... .     ))
                                                                                     44
   Operazione di lettura del nastro ......................... : .......... .    ))
                                                                                     45
   Operazione di registrazione sul nastro .............................. .      ))
                                                                                     47
   Montaggio dell'espansione RAM .................................... .         ))
                                                                                     47
   Utilizzo della cassetta registrata: "la tombola elettronica" ........... .   ))
                                                                                     47
   Software ........................................................... .       ))
                                                                                     48
   Esercitazione ....................................................... .      ))
                                                                                     50

CAPITOLO VI - I numeri negativi ...................................... .        ))
                                                                                     53
   Sottrazione tramite i numeri negativi ................................ .     ))
                                                                                     54
   L'Overflow ......................................................... .       ))
                                                                                     55
   L'istruzione SBC ................................................... .       ))
                                                                                     55
   Status .............................................................. .      ))
                                                                                     56
   Le istruzioni di Branch ............................................. .      ))
                                                                                     56
   lndex X ............................................................ .       ))
                                                                                     58
   Indirizzamento in pagina zero indicizzato ........................... .      ))
                                                                                     58
   Il Flow-Chart ....................................................... .      ))
                                                                                     59
   Le istruzioni del 6502 .............................................. .      ))
                                                                                     60
   Esercizi ............................................................ .      ))
                                                                                     60
   Un gioco: il "master mind" ......................................... .       ))
                                                                                     62

CAPITOLO VII - Registro indice V e Stack Pointer ..................... .        ))
                                                                                     63
   Il registro indice Y ................................................. .     ))
                                                                                     63
   Un esempio pratico ................................................ .        ))
                                                                                     64
   Uso del registro indice Y ........................................... .      ))
                                                                                     65
   Indirizzamento assoluto indicizzato ................................. .      ))
                                                                                     65
   Indirizzamento in pagina base ...................................... .       ))
                                                                                     66
   Pointer di Stack e Subroutine ...................................... .       ))
                                                                                     66
   Lancio di una Subroutine ........................................... .       ))
                                                                                     67
   Esempio di utilizzo di una Subroutine ................. '. ............ .    ))   67
   Istruzioni che caricano lo Stack Pointer ............................ .      ))
                                                                                     68
   Due esercizi pratici ................................................ .      ))
                                                                                     68
   Istruzioni di Shift e Rotazione ...................................... .     ))
                                                                                     69
   La moltiplicazione .................................................. .      ))
                                                                                     71
   Un gioco: "la corsa dei cavalli" .................... '. ............... .   ))
                                                                                     73

CAPITOLO VIII - Uso della porta utente ............................... .        ))
                                                                                     75
   La Subroutine del monitor .......................................... .       ))
                                                                                     77
   L'lnterrupt .......................................................... .     ))
                                                                                     82
   Tipi di interrupt .................................................... .     ))
                                                                                     83
   Il funzionamento della interruzione .................................. .     ))
                                                                                     83
   Il funzionamento di Reset .......................................... .       ))   84
   Esempio dell'uso di lnterrupt ....................................... .      ))
                                                                                     84
   Funzionamento in Single Step ...................................... .        ))
                                                                                     85

CAPITOLO IX - Ultime istruzioni di indirizzamento ..................... .       ))
                                                                                     87
   Sistemi di indirizzamento del 6502 ................................. .       ))
                                                                                     88
   Un esercizio ....................................................... .       ))
                                                                                     88
   Un gioco: il "tiro al bersaglio" ...................................... .    ))
                                                                                     89

CAPITOLO X - Il Listing del monitor ................................... .       ))   91
   Software ........................................................... .       ))
                                                                                     91

APPENDICE 1 .......................................................... .        ))
                                                                                     95
   Sommario istruzioni 6502 .......................................... .        ))
                                                                                     95

APPENDICE 2 .......................................................... .        ))   97
   Programmi applicativi per il microcomputer AMICO 2000 ........... .          ))   97
```

## Pagina PDF 9

```text
                                                            CAPITOLO I




                           COSA È UN MICROELABORATORE




     utti, chi più chi meno, abbiamo sen-         Con questo libro infatti e con un po'           L'argomento sarà trattato tenendo

T    tito parlare di "cervelli elettronici"
     o meglio di elaboratori, computers,
minicomputers e microcomputers.
                                               di buona volontà si imparerà a costruire
                                               e a utilizzare un microcomputer compo-
                                               nibile ed espandibile come potenza e
                                                                                                sempre presenti i seguenti tre fini:
                                                                                                A) L'insegnamento: struttura hardware
                                                                                                   (componenti, circuito stampato, etc.),
   Queste apparecchiature ci sono sempre       prestazioni, basato su un potente mi-               software (programmi di base ed ap-
state descritte come macchine compli-          croprocessore.                                      plicativi), istruzioni e linguaggi del
catissime, riservate unicamente agli ad-          Non si tratta del solito corso teorico           microcomputer.
detti ai lavori, mostri elettronici in grado   e noioso, al contrario: tutto ciò che trat-      B) La costruzione: il microcomputer, che
di compiere le più disparate e complesse       terà la parte teorica sarà direttamente             si chiama AMICO 2000A, viene for-
operazioni in tempi brevissimi.                attinente all'argomento preso in conside-           nito montato e collaudato o in scatola
   Fino a poco tempo fa gli elaboratori        razione senza inutili e spesso scorag-              di montaggio
si dividevano comunemente in due cate-         gianti approfondimenti.                          C) Programmi applicativi: giochi, mate-
gorie principali: i grandi elaboratori
(mainframes) ed i minielaboratori. In se-
guito la tecnologia dei circuiti integrati
ha generato la sua terza grande rivolu-
zione dopo quella del transistore e del
circuito integrato: il MICROPROCES-
SORE. Con questo dispositivo, che è un
 circuito integrato in grande scala (LSI =
Large Scale Integration), ovvero moltissi-
mi transistori, diodi e resistenze concen-
trati in uno stesso frammento di silicio
di pochi millimetri quadrati (vedi figura)
oggi chiunqu~, con un po' di studio e di
esercizio è in grado di costruirsi un vero
e proprio elaboratore elettronico di piccole
dimensioni detto MICROCOMPUTER
o MICROELABORATORE.
    Beninteso, con il prefisso "micro" si
vuole intendere piuttosto ridotto nelle
dimensioni e nei costi che non nella po-
tenza, visto che queste apparecchiature
hanno una capacità di elaborazione real-
mente notevole.
    Fino a poco tempo fa pensare di co-
struirsi un elaboratore elettronico poteva
essere giusto una battuta di spirito o
l'idea di un genio svitato e pieno di soldi.
    Oggi invece questo è possibile anche
per te che stai leggendo queste righe e,
te lo assicuriamo, anche se non sai asso-       Memoria RAM M4027 da 4096 bit della S.G.S. - A TES. il chip, la piastra al centro della foto,
lutamente nulla di elaborazione datL                          è la vera e propria memoria e misura 2,54 x 3,30 mm.

                                                                                                                                                9
```

## Pagina PDF 10

```text
r------------------------~------------------------------

                             BUS dati                       BUS dati                              Come è composto I'AMICO 2000A


                                                                                                     Il sistema a microprocessore che de-
                                                                                                  scriviamo in queste pagine è realizzato
           R'AM                           CPU                             ROM                     su un'unica scheda a circuito stampato
                                                                                                  ed è un vero e proprio microelabora-
                                                                                                  tore completo ed autosufficiente in grado
                                                                                                  di eseguire programmi di piccola e media
                                                       BUS dati                                   complessità. Con esso è possibile impa-
                                                                                                  rare a programmare e comprendere la
                                                                                                  filosofia dei microprocessori.
                                                                                                     Il sistema AMICO 2000 è provvisto
  MICROELABORATORE                                                                                di una tastiera per l'immissione dei dati
                                                                                                  e dei programmi e di un visualizzatore a
                                                                                                  LED che funge da dispositivo di con-
                                           1/0                                                    trollo e di "uscita" dati.
                                                                                                     Le caratteristiche elettriche sono ri-
                                                                                                  portate a fine capitolo.
                                                    ________________________ J
•------------------------
MONDO ESTERNO                                             Ingresso dei dati (segnali
                                                          elettrici) da elaboratore
                        Uscita dati (segnali                                                      Struttura di un microelaboratore
                        elettrici) elaborati

                                                                                                     Un microelaboratore è un sistema elet-
Fig. J - Schema a blocchi che mostra la struttura di un microelaboratore. Si noti che dalla ROM   tronico in grado di ricevere dall'esterno
                 (memoria a sola lettura) i dati possono essere solo richiamati.                  segnali elettrici, immagazzinarli, elabo-
                                                                                                  rarli secondo un certo programma, pren-
                                                                                                  dere delle decisioni e quindi emettere
                                                                                                  segnali elettrici utilizzabili all'estero.
                                                                                                     Essenzialmente un microelaboratore
                                                                                                  è composto da cinque "blocchi" funzio-
                                                                                                  nali:
    matica e programmi di utilita.               per tenere sotto controllo programmato
                                                                                                        CPU (Centrai Processing Unit): unità
   Così come è stata strutturata, questa         ed ottimizzato l'impianto di riscalda-              centrale di elaborazione.
trattazione è adatta al principiante o a         mento o per realizzare antifurti sofistica-
chi si diletta con l'hobby dell'elettronica,     tissimi, o ancora per innaffiare automati-             RAM (Random Access Memory): me-
agli studenti di ogni disciplina ed in par-      camente il nostro giardino.                         moria di lettura e scrittura.
ticolare modo di quelle scientifiche e tec-          Non sarebbe neanche tanto difficile
niche, ai neodiplomati in elettronica o          utilizzare l'elaboratore come rubrica te-              ROM (Read Only Memory): memoria
elettrotecnica che stanno per inserirsi          tefonica a chiamata diretta o, perché no, ·a sola lettura.
nel mondo del lavoro ed anche al tecnico         realizzare un controllo automatico del                 I/O (Input/Output): dispositivi di In-
esperto che deve aggiornare le sue cono-         nostro plastico dei trenini elettrici.              gresso/V scita.
scenze sulle tecnologie più avanzate.                   Potremo infine operare in campo
                                                 industriale realizzando semplici controlli .           BUS: insieme di "fili" (o piste) sui
                                                 di processo, automatismi, e tutta una. quali si muovono i segnali elettrici e che
                                                 serie di altre interessantissime applica-           collegano un "blocco" con l'altro.
                                                 zioni.                                                 La figura 1 mostra lo schema a bloc-
Cosa fare con un computer:                                                                           chi del microelaboratore. Le frecce al-
il limite è la fantasia                                                                              l'interno del BUS indicano il verso in
                                                                                                     cui si muovono i dati (sotto forma di
                                                                                                     gruppi di segnali elettrici) dentro l'elabo-
   Cosa significa possedere un elaborato-                    s                                       ratore.
re e saperlo usare?
    Di primo acchito saremmo portati a             ~o               ,t_ un filo            =-           Per meglio comprendere come funzio-
                                                                                                     na ciascuno dei "blocchi" costituenti il
pensare a cose strane, complicate, come                                                              microelaboratore faremo un diretto para-
il controllo della rotta di un missile, op-                                                          gone con il corpo umano. Il cervello
pure poco allettanti come la gestione                                                                sarà allora costituito da CPU+ ROM+
della Anagrafe Tributaria. Niente di tut-                                                            RAM, mentre i sensi ed i movimenti
to questo, fortunatamente il microelabo-                                                             del corpo possono essere assimilati al
ratore che costruirete non è destinato a                                                             "blocco" di I/O (Ingresso/Uscita).
risolvere questi problemi! Potremo inve-                                                                 Allora avremo che:
ce realizzare un mare di cose nuove e di-                                                                CPU-analizza gli stimoli provenienti
 vertenti come giochi elettronici di qual-                                                           dall'esterno attraverso i sensi (vedi I/O);
 siasi genere dettati dalla nostra fantasia,                                                         ricerca nella memoria ROM (vedi) e
 oppure eseguire delle complicate opera-                                                             RAM (vedi) una risposta allo stimolo;
 zioni di calcolo matematico.                    Fig. 2 - Rappresentazione pratica dei livelli logi- prende una decisione in base a ciò che
 L'elaboratore potrà essere utile in casa         ci (J e 1. Un filo premette due combinazioni.      c'è nella memoria; fa ese_guire l'azione.

10
```

## Pagina PDF 11

```text
   ROM- può essere paragonata a tutto
ciò che nella memoria umana è il baga-
glio di conoscenza che derivano dalla
educazione, dallo studio, e dalla espe-
rienza. Esse condizionano il comporta-
mento e non possono essere modificate
(ciò non è assolutamente vero nel caso
del cervello, ma lo assumeremo come
tale per semplicità di trattazione).
    RAM- Nella parte "RAM" del nostro
cervello sono depositate, cancellate e
nuovamente depositate tutte quelle infor-
mazioni che è necessario sapere momen-
taneamente o per uno specifico scopo,
ma che non condizionano permanente-
mente il nostro comportamento.
   I/O- gli input .(ingressi) possono essere
paragonati ai sensi tramite i quali si re-
cepiscono le informazioni (vista, tatto,
udito, etc), mentre gli output (uscite)
sono le parole ed i movimenti del corpo.
   BUS- i BUS dei dati non sono altro
che le interconnessioni nervose, ovvero i
 mezzi che permettono le comunicazioni
 all'interno del corpo (leggi nel nostro
 caso microcalcolatore).
Un esempio:
    Sempre assimilando il funzionamento
di un microelaboratore a quello di una
persona e per meglio comprendere l'ana-
logia consideriamo il seguente esempio:
un autista che sta guidando la sua auto
in una città che non conosce, chiede ad
un passante dove si trovi una certa via.
Quest'ultimo gli risponde che proseguen-
do diritto egli dovrà voltare a destra dopo
il primo semaforo che incontra.           .
    Allora: la CPU richiama dalla ROM
tutte le nozioni necessarie per poter gui-
 dare l'automobile; ecco allora che quan-
 do scatta il rosso l'autista si ferma al
 semaforo (il suo comportamento è stato
 e sarà sempre condizionato dalla ROM
ogni qualvolta si troverà .di fronte ad un
 semaforo).
    L'informazione momentanea ''voltare
 a destra dopo il primo semaforo" è stata
 depositata nella RAM così che la CPU
 ne tiene conto solo in quel determinato
 caso dando il comando agli arti di ese-
                                                             . Contenitori j/at-pack e Dual-in-Line per circuiti integrati. LSI.
 guire la curva a destra dopo quel sema-
 foro. Da allora in poi il nostro autista
  utilizzerà il programma "volta a destra
 dopo quel determinato semaforo" solo             Questi particolari segnali elettrici s1        quando l'interruttore S è aperto, ed uno
 quando dovrà andare in quella certa via       chiamano .. bit" e non sono altro che li-         stato logico 1 (lampadina accesa) quando
 (infatti non volterà a destra ad ogni sema-   velli alti o bassi di tensione.                   l'interruttore S è chiuso. Con un solo
 foro che incontra!).                             Con la parola .. bit", contrazione delle       filo possiamo avere quindi due combina-
                                               due parole inglesi binary digit. si designa       zioni (o 0 o 1) di un "bit". Se prendiamo
                                               l'unità elementare di informazione ovve-          ora in considerazione due fili, ovvero due
                                               ro uno dei due possibili stati o livelli lo-      "hit" (tralasciando sempre il ritorno di
                                               gici Oe I.                                        massa che è comune ad entrambi) pos-
                                                  Si parla allora di livello "basso" o           siamo avere quattro combinazioni diver-
                                               stato logico "0" (zero; barrato per non            se: 00; 10; 01; 11, come mostra la figura 3.
 Come funziona un microelaboratore
                                               confonderlo con la lettera O) e di livello            Siccome nell'elaboratore i segnali si
                                               alto o stato logico "1" (uno).                    muovono su più fili ognuno dei quali
                                                  Se consideriamo per esempio il sem-            può portare il livello logico 0 o 1, avremo
    Abbiamo detto che all'interno di un        plicissimo circuito di fig. 2 a un solo filo      così che il numero di combinazione pos-
 microelaboratore circolano dei segnali        (il ritorno di massa a terra non deve             sibili è dato dalla relazione:
 elettrici che passano da un blocco all'al-    essere preso in considerazione) avremo                   2n = numero di combinazioni
 tro attraverso il BUS dei dati.               uno stato logico "0" (lampadina spenta)           dove n è il numero dei fili.

                                                                                                                                           11
```

## Pagina PDF 12

```text
                                                                                                      Dal codice binario al codice esadecimale


                                                                                                       Per poter comunicare con il microcal-
                                                                                                      colatore dovremo allora immettere i dati
                                                                                                      come serie di 0 e di 1 o parole di un
                                                                                                      certo numero di bit (nel nostro caso fino
                                                                                                      ad un massimo di 16 per volta).
                                                                                                         In questo caso noi comunichiamo con
                                                                                                      l'elaboratore in "linguaggio macchina"
                                                                                                      ovvero nel linguaggio proprio della
                                                                                                      "macchina" calcolatore, che, come ab-
                                                                                                      biamo visto "ragiona" in binario.
                                                                                                         Sarebbe però troppo lungo, noioso e
                                                                                                      fonte di errori immettere parole fatte di
                                                                                                      0 e 1, così che al posto del codice
                                                                                                      binario si può utilizzare un più semplice
                                                                                                      codice detto ESADECIMALE.
                                                                                                          Questo codice fa riferimento al sistema
                                                                                                      di calcolo esadecimale che si fonda su
                                                                                                      una base, o radice, di 16, così come il
                                                                                                      sistema decimale si fonda su una base
                                                                                                      di 10 e quello binario su una base di 2.
                                                                                                          Come si trasforma il codice binario
                                                                                                      in codice esadecimale?
                                                                                                          È molto semplice: si considera una
                                                                                                      parola di 4 bit nelle sue possibili (e cre-
                                                                                                      scenti come valore) 24 = 16 diverse com-
                                                                                                      binazioni assegnando i valori dallo 0 al
                                                                                                      9 per i primi dieci numeri e le lettere
                                                                                                      dalla A alla F per i successivi sei numeri
                                                                                                      binari. La tabella 2 mostra due succes-
                                                                                                      sive trasformazioni: da binario a deci-
                                                                                                      male ed a esadecimale.
                                                                                                          Allora se dobbiamo scrivere e/o comu-
                                                                                                      nicare all'elaboratore ad esempio la "pa-
      Prove e collaudi hardware e sofì~are e sui sistemi elettronici di elaborazione dati.            rola" di 16 bit:
                                                                                                                    0111101010111011
                                                                                                      basterà scrivere 7ABB, cioè scomporre
                                                                                                      la parola in 4 gruppi di 4 bit ciascuno
   Allora con 8 fili ovvero con una serie         ad esempio espresso in base 10 (cioè                come mostrato in fig. 4.
o "parola" di 8 bit (detta solitamente byte)      decimale):                                             In pratica ciò avviene attraverso una
è possibile avere 28 = 256 diverse combi-         4765 = (4 X 10 3) + (7 X 102) +                     tastiera esadecimale (organo di input) a
nazioni e con 16 fili, ovvero 16 bit, è                      + (6 X 10 1) + (5 X 10°)                 sedici tasti numerati da 0 a F presente
possibile avere 2' 6 = 65536 diverse com-
binazioni. Presto vedremo perché sono
particolarmente importanti i valori 8 e 16.
La tabella 1 mostra le potenze crescenti
da 2° a 2' 6• Il tipo di numerazione che
                                                                      ~o--0
abbiamo appena esaminato e che utilizza
i due stati 0 e 1 è detta numerazione
binaria o codice digitale binario.
   Con un numero binario, che è costi-
                                                                      ~o-é                     }      3
                                                                                                     1 combinazione di 2 bit



tuito da una serie di bit (o stati logici
                                                                      ---o-"'t>----- 1

                                                                                             0 }
0 e 1) è possibile rappresentare un nu-
                                                                                                     2a combinazione di 2 bit
mero decimale. Allora il numero binario
                                                                      ~o--
di 4 bit 0110 2 (l'indice 2 rappresenta il
sistema di conteggio binario - in base 2)
                                                                                             ~
equivale al numero decimale 6 10•                                     ---<f"'~
   Per verificarlo basta usare la seguente
formula di trasformazione:                                            --~O-O                 1 }      3a combinazione di 2 bit



                                                                      ----o-"tl              1

         +   (1 X 2 1)   + (0 X 2°) = 6
                                                                      ---0"""'0---           1 }      4a combinazione di 2 bit



infatti l'esatto parallelo col sistema deci-
male mostra che il numero 4765 viene                       Fig. 3 - Con due fili (due bit) è possibile ottenere quattro differenti combinazioni.

12
```

## Pagina PDF 13

```text
                                          PAROLA          DI    16 BIT

        CODICE BINARIO                 0111        1010         1011        1011
                                      ~           ...__,_....   ~         ..._,,.._,
         CODICE ESADECIMALE
                                           "" 7 \A. BI B /
     Fig. 4 - Trasformazione di una serie o PAROLA di 16 bit da binario ad esadecimale.


sul nostro microcomputer (vedi figura 5).      un altro BUS detto BUS INDIRIZZI
Quando si preme un tasto un programma          formato generalmente da 16 fili (nel no-                    Fig. 5 - Tastiera esadecimale.
presente in ROM riconosce quale tasto          stro caso sarà infatti di 16 fili), per mez-
è stato pemuto e associa il valore binario
corrispondente (4 bit) al carattere esade-
cimale introdotto (vedi tabella preceden-
te). Per esempio premendo il tasto cor-
rispondente al carattere esadecimale D il
calcolatore riconoscerà il numero bina-
rio 1101.




Movimento e controllo dei dati in un
microprocessore a 8 bit.

   Il nostro microcalcolatore è basato su
una CPU, ovvero su un microprocessore
a 8 bit Ciò significa che esso è in grado
di trattare 8 bit contemporaneamente.
I dati, sotto forma di parole costituite da
8 bit ovvero byte (8 bit = 1 byte), si
muovono in ingresso ed in uscita nel
BUS DA TI formato da 8 fili. Esiste anche




    TABELLA 1 - Potenze di 2

   20 = 1
   21 = 2
   22 = 4
   23 = 8
   24 = 16
   25 = 32
   26 = 64
   27 = 128
   28 = 256
   2Q = 512
   210 = 1.024
   211 = 2.048
   212 = 4.096
   213 = 8.192
   214 = 16.384
   215 = 32.768
   216 = 65.536
                                                            Al centro de/l'immagine una fase di fabbricazione di un circuito integrato.

                                                                                                                                            13
```

## Pagina PDF 14

```text
                                                             Bus dati                                                                               zo del quale la CPU legge (nella memoria
                                                             ( 8 fili )                                                                             ROM, RAM o dall'l/O) oppure scrive(nel-
                                                                                                                                                    la memoria RAM) o invia (all'l/O) il dato.'
     !--Bus indirizzi -                                           I       ..,. .,.,I   I                                                                Con un BUS INDIRIZZI di 16 fili il
                                        - :e- :c- :e- - ·- i i
                                  J
                                        Q                N       M                     te             r-
         ( 16 fili)                                                                                                                                 microprocessore ha la possibilità di indi-
                                                                          :e :c
     l,,;,••; ;;;; ;;;;;;,; ;;;1,,..
                                        :e
           I lo~~~i~~~
                         11                                                                                                                         rizzare, ovvero di ll!/!.gere o scrivere il
                              1111                                                                          /         1a locazione
       J



             ;;;;                                                                                                                                   dato in 65.536 (cioè 2 1 ) diverse posizioni.
                                                                      .                     ""                      Locazione di memoria da 8 bit   Il numero dei fili del BUS INDIRIZZI
                                                                                                                    in ogni locazione puo' essere   infatti definisce la capacità di indirizza-
                                                                                                                                       8
                                                                                                                    scritta una delle 2 = 256       mento del sistema, dove per capacità di
     ~,,, ,~,,       ;;;; ;;1f                                                                                      possibili parole da 8 b,it
                                                                                                                                                    indirizzamento si intende la quantità di
                                                                                                                                                    LOCAZIONI DI MEMORIA che il mi-
     ,,,, '''' "" ,,1
                etc.
                                  1

                                             4                                                   •·
                                                                                                                                                    croprocessore è in grado di leggere e/o
                                                                                                                                                    di scrivere.
                                                                                                                                                        Per locazione di memoria si intende
                                             ;,
                                                                                                                                                    l'insieme di 8 celle elementari (ciascuna
                                                                                                                                                    in grado di memorizzare un bit) in cui
                                                                                                                                                    vengono conservati 8 bit ovvero 8 stati
                                                                                                                                                     logici (esempio 10011010). Ad ognuna
                                       t,..--......._ ....__ L/...--~..__ V                                I/
                                                                                                                                                    delle possibili 65536 locazioni corrispon-

                                  /    --r-...     ":----__./'
                                                                          ~--
                                                                                   'r---/
                                                                                                                                                    de uno ed un solo indirizzo. In ogni
                                                                                                                                                    locazione di memoria (che, come abbia-
                                                                                                                                                    mo visto contiene 8 bit, cioè un byte),
                                                                                                                                                    attraverso il BUS DATI (che è formato
                                             ...                                                                                                    da otto fili) si potrà depositare o leggere
                                                                                                                                                    una delle 28 = 256 diverse combinazioni
                                                                                                                                                    binarie possibili con otto bit.
                                                   ...
                                                                                                                                                        La figura 6 rappresenta schematica-
                                                                                                                                                    mente la memoria potenziale del nostro
                                                                                                                                                    sistema a microprocessore (ovvero la
                                                                              "'                                                                    massima capacità di memoria da esso
      1111 1111 1111 11; ~                                                                                                                          indirizzabile)
                                                                                                                                                        Il microprocessore è quindi capace di
      1111 1111 1111 11,1                                                                                                                            leggere o scrivere parole da 8 bit in una
                                                                          .
                                                                                                                                                     qualsiasi delle 65536 locazioni dalla
      1111 1111 1111 111

      1111 1111 1111 111 1        '                                                                             /     65"536alocazione
                                                                                                                                                     0000000000000000 (0000 in esadecimale)
                                                                                                                                                     alla 1111111111111111 (FFFF in esade-
                                                                                                                                                     cimale).

Fig. 6 - Schema che illustra il sistema di indirizzamento di memoria del nostro microcalcolatore.
          Sono indirizzabili 2 16 = 65536 locazioni di memoria da 8 bit (un Byte) ciascuna.
                                                                                                                                                      CARATTERISTICHE TECNICHE
                                                                                                                                                      DEL MICROELABORATORE
                                                                                                                                                      AMICO 2000
      TABELLA 2 - Trasformazione da numerazione binaria decimale a esadecimale
                                                                                                                                                      - CPU: microprocessore 6502
            BINARIO                                          DECIMALE                                                    ESADECIMALE
                                                                                                                                                      - Memoria RAM: fino a 2K byte
                000~                                                  0                                                              0                  sulla scheda
                0001                                                                                                                                  - Memoria ROM: lK byte con Monitor
                                                                                                                                                        e gestione cassette
                0010                                                  2                                                              2
                                                                                                                                                      - Tastiera esadecimale
                0011                                                  3                                                              3                - 7 tasti funzionali + deviatore
                0100                                                  4                                                              4                  per passo singolo
                0101                                                  5                                                              5                - Visualizzatore LED a 6 cifre
                                                                                                                                                      - Interfaccia parallelo 8 bit
                0110                                                  6                                                              6                  (Port di Input/Output)
                0111                                                  7                                                              7                - Interfaccia per registratore a. cassette
                1000                                                  8                                                              8                - Clock quarzato da 1 MHz
                1001                                                  9                                                              9                - Regolatore di tensione incorporato
                1010                                                  10                                                             A                - Protezione contro l'inversione di polarità
                1011                                                  11                                                             B                - Alimentazione: 5 Volt, 800 mA max
                                                                                                                                                      - Espandibile: a mezzo connettore 40 poli
                1100                                                  12                                                             c
                                                                                                                                                      - Circuito stampato doppia faccia
                1101                                                  13                                                             D                  in vetronite
                1110                                                  14                                                             E                - Dimensioni: 300 x 160 mm.
                lll L                                                 15                                                             F

14
```

## Pagina PDF 15

```text
                                                          CAPITOLO Il




                 IL LINGUAGGIO DEL MICROELABORATORE




                                               vario genere. Nessun limite alle applica-     termini colloquiali, come ad esempio
Cosa è un programma                            zioni tranne la fantasia e lo spirito di      "somma il numero A al numero B e
                                               inventiva.                                    scrivi il risultato". Successivamente
                                                                                             questo vi~ne tradotto in un linguaggio
                                                                                             mtermed10 fra noi e la macchina cioè
                                               Il microelaboratore                           un linguaggio che noi possiamo c'apire
          artendo da certi input (dati in

P       . ingresso) e volendo ottenere certi
          output (dati in uscita) occorre
far muovere i segnali così come noi
vogliamo; questo risultato è ottenibile
                                               e il suo linguaggio                           essendo esso "simbolico" o "mnemo-
                                                                                             nico" in quanto ogni istruzione è for-
                                                                                             mata da abbreviazioni di parole che
                                                                                             associamo immediatamente ad una
                                                  Riprendendo il paragone iniziato nel       operazione che ci è ben chiara.
grazie ad un insieme di istruzioni             capitolo precedente tra microelabora-
(o comandi) che possiamo combinare                                                             A questo punto è facile scrivere a
                                                tore e uomo, possiamo dire che volen-       fianco la traduzione esadecimale di
logicamente secondo le nostre esigenze,         do , ad esempio, far eseguire ad un
insieme che chiameremo programma.                                                           questo linguaggio intermedio, cioè
                                                nostro amico una addizzione tra due         quella comprensibile direttamente dal-
    Tutti i progetti che non utilizzano il      numeri gli diremo: "Somma il numero         la macchina. Noi forniremo pertanto i
microprocessore infatti sono progetti           A al numero Be scrivi il risultato su un    programmi in esadecimale, e la mac-
"specifici'; che esplicano cioé una ben         foglio". Ci siamo avvalsi di un linguag-    china provvederà alla ulteriore tradu-
determinata funzione (un frequenzime-           gio che anche il nostro amico parla e       zione diretta in binario.
tro, un voltmetro digitale, un contatore,      capisce, e che associa ad un vocabolo           Il passaggio più complesso è pertan-
etc.) e realizzati dalle diverse combina-      come "somma" una operazione uni-             to quello da linguaggio intermedio
zioni di circuiti integrati. Ogni progetto     vocamente identificabile ed eseguibile       (mnemonico) a linguaggio macchina
espleta solamente una determinata fun-         su dei dati che pure vengono forniti in      in esadecimale, passaggio che viene
zione, è uno strumento "specifico'; in         modo definito.                               effettuato o manualmente tramite una
grado di svolgere solo quella specifica           Anche il microelaboratore parla un        tabella, (vedi tabella 3) oppure, in ma-
attività per la quale è stato disegnato.       suo linguaggio (linguaggio macchina)         niera più evoluta tramite un apposito
                                               ed è in grado di fare esattamente ciò        programma chiamato Assembler o
     Con il microelaboratore invece viene      che vogliamo, se sappiamo parlargli
 effettuato un salto di qualità rispetto a                                                  traduttore.
                                               nel suo linguaggio. Come avevamo
 questo tipo di impostazione perchè,            aécennato nel capitolo 1° il microela-
 cambiando semplicemente programma,            boratore lavora in termini binari e
 è possibile cambiare la funzione del          pertanto il suo linguaggio originale è
  microelaboratore, che infatti è uno                                                        Un esempio pratico
                                               binario. D'altro canto abbiamo visto
 strumento flessibile e di utilizzo uni-       che sarebbe troppo lungo. e fonte di
  versale, cioè non 'più specifico.             molti errori utilizzare insiemi di 0 e di
     Sostituendo il programma sarà pos-         1 per parlare con il microelaboratore,         Per meglio comprendere tutto ciò
 sibile cambiare in pochi istanti l'utilizzo   essendo il "linguaggio" basato sul co-       facciamo un esempio applicativo piutto-
del microelaboratore, passando per             dice .binario troppo diverso da' quello      sto elementare, ma molto efficace ai
esempio da un gioco al controllo del           che comunemente utilizziamo per ri-          nostri fini.
riscaldamento domestico o di un pro-           solvere i nostri problemi. Come fare            Supponiamo di voler eseguire la se-
cesso produttivo.                              allora per comunicare in modo più            guente operazione: 3 + S = 8 e suppo-
     Il microcomputer è in grado di ese-       semplice con il nostro microelaborato-       niamo anche di aver già introdotto il
 guire un insieme di operazioni elemen-         re indicandogli le operazioni che deve      numero 'T' (ffM7.X:) 11) in binario e
 ta.ri (ad esempio A + B, A and B, A =          svolgere?                                   0 3 in esadecimale) nella sesta locazio-
 A) che, opportunamente disposte, per-             In un primo momento viene analiz-         ne di memoria e il numero "5" t00000101
metteranno di creare applicazioni nei           zato il problema e sviluppato un pro-        in binario e 05 in esadecimale) nella set-
più svariati campi ed anche giochi di           gramma nel nostro linguaggio, cioè in        tima locazione di memoria.

                                                                                                                                     15
```

## Pagina PDF 16

```text
Tavola A - Rappresentazione dei .. linguaggi" e del movimento dei dati all'interno del microelaboratore in base alle istruzioni contenute in un
semplice programma che consente di sommare due numeri.



        ISTRUZIONI                 LINGUAGGIO DISCORSIVO                  LINGUAGGIO SIMBOLICO                   LINGUAGGIO MACCHINA
                                   (il nostro, non comprensibile dal      (intermedio tra il nostro e quello     (è il linguaggio del microelabora-
                                   microelaboratore)                      dcl micro)                             tore)




         I a istruzione            Preleva dalla sesta posmone di         LDA 06                                                A5
                                   memoria RAM il dato e traspor-         ( LDA sta per Load Accumula tor                       06
                                   talo nel registro interno (ACCU-       e ~6 indica in esadecimale la posi-
                                   MULA TOR E)* dcli' unità di ela-       1.ionc di memoria nella quale si       (A5 è la traduzione di LDA in
                                   borazione (CPU).                       trova il dato da trasferire).          esadecimale).




          2a istruzione            Preleva il dato contenuto nella         ADC ITT                                              65
                                   settima posizione di memoria RAM       (!\DC sta per Add Memory to                          $17
                                   e sommalo al dato contenuto nel         ;\ccumulator con Carry; la fun-       (65 è la traduzione di ADC in
                                   registro interno (ACCUMULATO-          1ione dcl Carry sarà spiegata in       esadecimale).
                                   RE) della CPU.                         -.,i.:guico.
                                                                          fil indica, in esadecimale, la posi-
                                                                          1.ione <li mcnwria che contiene il
                                                                          dato da sommare all'ACCUMU-
                                                                           LATORE.




          38 istruzione            Trasferisci il risultato dall' ACCU-   STAV4                                                  85
                                   MULATORE alla quarta locazio-          (STA significa Store Accumula-                        .0'4
                                   ne di memoria RAM.                     tor, istruzione di scrittura nella     ( 85 è la traduzione di STA m
                                                                          .RAM).                                 esadecimale).
                                                                          04 indica in csadi.:cimalc la posi-
                                                                          ziont: di memoria nella quale deve
                                                                          essere ricopiato il contenuto dello
                                                                           ACCUMULATORE.




* Il significato del termine viene spiegato in questo capitolo.


16
```

## Pagina PDF 17

```text
RAPPRLSFNTAZIONL DLI.I.O STATO DEL SISTEMA                                                                             NOTE

                                                  ME MORIA (binario)

                                                    ZONA DATI              LOCAZIONE (esadecimale)    Si tratta di una isruzione da drre bytes,
                                                                             ,,, 3                    contenuta nella posizione di memoria




                                                  ..
                                                                              ,,, 4                   0008 e 000C, posizioni indicate dal
                                                                                                      Program Counter (PC) prima della
                                                                                                      esecuzione. Eseguita l'istruzione il con-

   ACC
                                      -~-----·  , , ,,               ,1
                                                                              -·· 5
                                                                              '
                                                                              ,,',
                                                                                 ' 67
                                                                              ,,, 8
                                                                                                      tenuto del PC è 0000 che rappresen-
                                                                                                      ta l'indirizzo da cui verrà prelevata la
                                                                                                      prossima istruzione.


                 c P u
                                                                           LOCAZIONE (esadecimale)
   PC                                                                         •• ,   A
                                                                              ,,, e
                                                                              ,,. c
                                                                              ,,, D
                                                                              ,., E
                                                                              .,, F




                                                  MEMORIA (binario)
                                                                                                      Anche questa è una istruzione da due
  Risultato dell'addizione                           ZONA DATI             LOCAZIONE (esadecimale )   bytes.
                                                                              ,,. 3                   Il dato contenuto nella settima posizio-
                                                                              ,,. 4                   ne di memoria viene sommato al con-
                                                                                                      tenuto dell'ACCUMULATORE che, a
                                                                              ,,, s

                                                                     ,
                                                                                                      istruzione eseguita, contiene il risultato
                                                                       1      , •• 6                  dell'addizione.
                                                                              ,., 7
                                                                              ,,, 8

                 c P u
                                                         PROGRAMMA         LOCAZIONE (esadecimale)
                                                                              ,,, A
   PC

                                                                              '''e
                                                                              ,,, e
                                                                              ,,, D
                                                                              ,,, E


                                                                              ,,1 ,
                                                                              ,., F




                                                   MEMORIA DATI            LOCAZIONE(esadecimale)     Come si vede dalla figura a lato il
                                                                                                      contenuto dell'ACCUMULATORE è
                                     ----•11••1, ,,                                                   stato ricopiato nella locazione di me-
                                                                                                      moria 0004.


                                                ,,,,,,,
                                                                                                      Il contenuto dell'ACCUMULATORE
                                                ,,,,,,                 1                              rimane invaria~o.

  ACC


                 CPU

                                                MEMORIA PROGRAMMA          LOCAZIONE (esadecimale.)
                                                                              ,,, A
   PC           , .8' 11
                                                                              jf j1g B
                                                                              jtj jJ c
                                                                              ••• D
                                                                              SJJE
                                                                             ,,,,
                                                                              J1 . , F


                                       4--~ - - --             --
Le frecce tratteggiate relative alla posizione del Programm . Comuter indicano la situazione ad istruzione eseguita.
```

## Pagina PDF 18

```text
                                                                                            zioni in modo da permettervi alla fine
                       BUS                         memoria                                  di prqgrammare autonomamente il vo-
                                                                                            stro microcomputer.
                                                                                               Il semplice insieme di istruzioni con-
                                                                                            siderato nella tavola A permette quindi
                                                                                            di sommare due numeri e di porre il
                                                                                            risultato in memoria; già queste poche
                                                                                            istruzioni possono costituire un "pro-
                                                           ACC                              gramma".
                                                                                               Un programma può risiedere sia in
                                                                                            memoria ROM che in memoria RAM;
                                                                                            il primo caso è classico per il program-
                                                                                            ma chiamato MONITOR, che permette
                                                                                            di eseguire alcune attività basilari come,
                                                                                            ad esempio, quelle di input ed output dei
                                                           3
                                                                                            dati. I programmi che effettueremo .~oi
                                                                                            a scopo didattico o per diletto, ven-:::;,n-
                                                                                            no invece solitamente immessi in RAM,
                                                                                            memoria che può essere scritta e letta
                                                                                            dall'utilizzatore e pertanto modificata
                                                                                            a piacere.
                                                                                               Per inciso notiamo che i programmi
                                                               PC                           contenuti nella memoria RAM vengo-
                                                                                            no mantenuti finchè permane l'alimen-
                                                                                            tazione.
                                                                                               Togliendo l'alimentazione i program-
                                                                                            mi contenuti in RAM vanno a carte
                                                                                            quarantotto!! Ciò non avviene per
        Alcuni dettagli della CPU: Unità aritmetico-logica (ALU), Accumulatore (ACC)        quelli contenuti in ROM.
                                   e Program Counter (PC).                                  Le operazioni di esecuzione del pro-
                                                                                            gramma si svolgono in pratica nel
                                                                                            modo seguente (Vedere la figura nella
                                                                                            Tavola A).
   Vogliamo ora che il microelaboratore        concetti fondamentali che, se ben
esegua la somma e che depositi il risul-                                                    La CPU legge la prima istruzione del
                                               compresi, permetteranno di seguire con
                                                                                            programma, la interpreta e la. esegue; a
tato nella quarta posizione (o locazio-        molta facilità il resto della trattazione.
ne) di memoria. Questo insieme di                                                           questo punto la CPU legge l'istruzione
                                               In sostanza vengono esaminate tre del-       successiva, la interpreta ed esegue, e
operazioni può essere rappresentato            le più importanti istruzioni del micro-
come nella tavola A.                           processore 6502 che è il "cervello"          procede nello stesso modo in maniera
   La tavola A è da studiare con atten-                                                     sequenziale fino alla completa esecu-
                                               dell' AMICO 2000A. E così in seguito         zione del programma, cioè fino a che
zione: in essa vengono spiegé:\ti alcuni       saranno analizzate via via tutte le istru-
                                                                                            non troverà una istruzione di fine pro-
                                                                                            gramma.
                                                                                             La CPU è in grado di capire ed eseguire
                                                                                            un certo numero di ordini diversi, che
                                                                                            costituiscono l'insieme delle possibili
                                                                                            istruzioni, o set di istruzioni.
     Tabella 3 - Traduzione delle istruzioni del microprocessore 6502 (che è                    In particolare, per il microproces-
     la CPU utilizzata nel microcomputer AMICO 2000A) da rappresentazio::.                   sore che è utilizzato nel microelabo-
     ne in CODICE ESADECIMALE a èINGUAGGIO SIMBOLICO.                                        ratore AMICO 2000, il set è composto
                                                                                             da 56 istruzioni, ma esistono anche dei
                                                                                             microprocessori con oltre 150 istru-
                                                                                             zioni.
        00 - BRK                                      24 - BIT - Zero Page
        01 - ORA - (Indìrect, X)                      25 - AND - Zero Page
        05 - ORA - Zero Page                          26 - ROL - Zero page
        06 - ASL - Zero Page                          28 - PLP
        08 - PHP                                                                            Il program counter
                                                      29 - AND - Immediate
        09 - ORA - Immediate                          2A - ROL - Accumulator
        0A - ASL - Accumulator                                                              Evidentemente la CPU non può co-
        @D - ORA - Absolute                           2C - BIT - Absolute                   minciare ad eseguire istruzioni parten-
        0E - ASL - Absolute                           2D - AND - Absolute                   do da un punto qualsiasi della memoria
        10 - BPL                                      2E - ROL - Absolute                   e seguendo un ordine casuale, ma deve
        11 - ORA - (Indirect), Y                                                            iniziare l'esecuzione partendo da un
        15 - ORA - Zero Page, X                       30 - BMI                              punto ben preciso, che rappresenta
        16 - ASL - Zero Page, X                       31 - AND (Indirect), Y                l'inizio del programma (nel caso parti-
        18 - CLC                                      35 - AND - Zero Page, X               colare del nostro esempio la locazione
        19 - ORA - 1\.bsolute, Y                      36 - ROL - Zero Page, X               di memoria 000B).
        ID - ORA - Absolute, X                        38 - SEC                              In concreto nella CPU si trova un
        lE - ASL - Absolute, X                        39 - AND - Absolute, Y                importantissimo registro, chiamato
        20 - JSR                                      3D - AND - Absolute, X,               Program Counter (contatore di pro-
        21 - AND - (Indirect, X)                      3E - ROL - Absolute, X                gramma) che contiene l'indirizzo della
                                                                                            locazione di memoria dalla quale verrà

18
```

## Pagina PDF 19

```text
                                                                                  si posmona automaticamente sull'in-
  Segùe Tabella 3                                                                 dirizzo della istruzione da es~guire su-
                                                                                  bito dopo e non richiede pertanto alcun
     40 - RTI                              A2 - LPX - Immediate                   intervento da parte nostra.
     41 - EOR - (Indirect , X)             A4 - LDY - Zero Page                   In particolare riferendoci all'esempio
     4S - EO R - Zero page                 AS - LDA - Zero Page                   riportato, il Program Counter (posto
     46 - LSR - Zero Pagè                  A6 - LO X - Zero Page                   in partenza a 000B dall'utente) sarà
     48 - PHA                              A8-TAY                                  000B all'inizio del programma, 0000
     49 - EOR ~ Immediate                  A9 - LDA - Immediate                    dopo aver eseguito la prima istruzione,
     4A - LSR - Accumulator                AA -TAX                                 000F dopo aver eseguito la seconda e
     4C - JMP - Absolute                   AC - LDY - Absolute                     00 11 dopo aver effettuato _la terza. II
     40 - EOR - Absolute                   AD - LDA - Absolute                    fatto che il Program Counter incre-
     4E - LSR - Absolute                   AE :. LDX - Absolute                   menti di 2 è dovuto al tipo di istruzione
                                                                                  che la macchina sta eseguendo: in pra-
     S0 - BVC                              B0 - BCS                               tica la maggior parte di istruzioni com-
     S l - EOR - (Indired), Y              BI - LDA - (Indirect), Y               porta un increniento di 2, ovvero esse
     SS - ç:OR - Zero Page, X              B4 - LD Y - Zero Page, X               occupano due locazioni di memoria
     S6 - LSR - Zero Page, X               B5 - LDA - Zero page, X                consecutive (due byte). Esistono però
     S8 - CLI                              B6 - LDX - Zero Page, Y                anche istruzioni che occupano uno o
     S9 - EOR .:. Absolute, Y              B8 - CLV                               tre byte; in questo caso il PC si incre-
     SO - EOR - Absolute, X                B9 - LDA - Absolute, Y                 menterà automaticamente di I e 3
     SE - LSR - Absolute, X                BA -TSX                                rispettivamente, puntando sulla istru-
                                           BC - LDY - Absolute, X                 zione successiva.
     60 - RTS                              BD - LDA - Absolute, X                   Il contenuto del Program Counter
     61 - ADC - (Indirect, X)              BE - LDX - Absolute; Y                 può infine essere anche modificato dal-
     6S - ADC - Zero Page                  C0 - CPY - Immediate                   l'utilizzatore grazie ad alcune istruzioni
     66 - ROR - Zero Page                  C 1 - CMP - (Indirect; X)              che permettono di saltare da un punto
     68 - PLA                              C4 - CPY - Zero Page                   all'altro del programma senza dover
     69 - ADC - Immediate                  CS - CMP - Zero Page                   seguire una rigida sequenza di coman-
     6A - ROR - Accumulator                C6 - D EC - Zero Page                  di.
     6C - JMP - Indirect                   C8 - INY
     6D - ADC - Absolute                   C9 - CMP - Immediate
     6E - ROR - Absolute                   CA - DÉX
                                           CC - CPY - Absolute                    Le istruzioni esaminate
     70 - BVS                              CD - CMP - Absolute
     71 - ÀDç - (indired), Y               CE - DEC - Absolute                    Le tre istruzioni sin qui incontrate pos-
     75 - ADC - Zero Page, X                                                      sono essere così esemplificate:
     76 - ROR - Zero Page, X               D0 - BNE ,
     78 - SEi                              D 1 - CMP - (Indirect), Y              LDA     M = M-A
     79 - ADC .:. Absolute, Y              DS - CMP - Zero page; X                ADC     M =A+ M -A
     7D - ADC - Absolute. X                06 - DEC - Zero Page, X
     7E - ROR - Absolute, X                D8-CLD                                 M = locazione di memoria qualsiasi
                                           D9 - CMP - Absolute, Y
                                                                                  A      Accumulatore
     81 - STA - (Ihdirect, X)              DD - CMP - Ab~olute, X
     84 :. STY .:. Zero Page               DE - DEC - Absolute, X                 +      simbolo di somma
     8S - STA - Zero Page
     86 - STX - Zero Page
                                           E0 - CPX - Immeé:i·iate                    = Simbolo di trasferimento che
                                           E 1 - SBC - (Indirect, X)              indica il movimento del dato da .... a ...
     88 - DEY                              E4 - CPX - Zero Page~
     8A - T XA                                                                    Le due istruzioni LDA e STA consen-
                                           ES - SBC - Zero Page                   tono di muovere un dato (byte) tra
     8C - STY - Absolute
                                           E6 - INC - Zero Page                   memoria e Accuniulatote. Queste ope-
     8D - StA - Absolute
                                           E8 - INX                               razioni sono fondamentali e ciò le
     8E - STX . : Absolute
                                           E9 - SBC - Immediate                   re~de tra le più utiiizzate nei program-
                                           EA .:. NOP                             m1.
     90 - Bee                              EC - CPX - Absolute
     91 - STA (Indirect), Y
                                           ED - SBC - Absolute
     94 - STY - Zèro Page, X               EE - INC - Absolute
     9S - STA :. Zero page, X
     96 - STX - Zero page, Y               F0 - BEQ
     98 - TYA                              Fl - SBC (Indirect), y                 Alcuni dettagli sulla CPU
     99 - STA - Absolute, Y                FS - SBC - Zero Page X
     9A - txs                              F6 - INC - Zero Page, X
     9D - STA - Absolute, X                F8 - SED                               Sino ad ora abbiamo accennato alla
                                           F9 - SBC - Àbsolute, Y                 presenza, all'interno della CPU, dei
     A0 · LDY - Immediate                  FD - SBC - Absòlute, X                 seguenti elementi:
     A 1 - LDA - (Iridirect, X)            FE - INC .- Absoiute, X                ACCUMULATORE (ACC)
                                                                                  PROGRAM COUNTER (PC)
                                                                                  ALU (Arithmetic-logic unit, unità a-
                                                                                  ritmetico-logica).
prelevata la prossima istruzione del    struzione da eseguire. Per questo moti-
programma che la CPU deve eseguire.     vo si parla anche di Puntatore (in        L'Accumulatore ed il Program Coun-
In linguaggio più tecnico il Program    inglese "Pointer").                       ter sono due registri assai importanti, e
Counter (abbreviato PC) "punta" ( ov-   Dopo aver eseguito una istruzione del     l'ALU è il vero e proprio "cuore" della
vero indica alla CPU) la prossima i-    programma il Program Counter (PC)         CPU.

                                                                                                                         19
```

## Pagina PDF 20

```text
Si può quindi per ora schematizzare la
CPU come in figura 7. Facendo riferimen-
to al nostro esempio analizziamo il
flusso dei dati '.dl'interno della CPU
durante l'esecr zione dell'istruzione
ADC 07 (cioè la somma).
li primo dato, contenuto nell'accumu-
latore, viene trasferito ad uno dei due
ingressi dell'ALU (freccia l), immedia-
tamente dopo, attraverso il Bus Dati
viene presentato (freccia 2) al secondo
ingresso del I' AL U il dato contenuto
nella settima locazione di memoria (in-
fatti l'istruzione era ADC 07, che vuol
dire somma il contenuto ddla settima
locazione all'accumulatore). Avendo a
disposizione entrambi i dati necessari
all'esecuzione dell'istruzione I' AL U e-
segue la somma al suo interno e trasferi-
sce (freccia J) il risultato dell'operazio-
ne nell'accumulatore, sostituendo il
contenuto precedente. Tutte queste o-
 perazioni vengono eseguite in maniera
 automatica dalla CPU, e l'operatore
 non deve intervenire in alcun modo.
   Fino a questo punto abbiamo chiarito
i principi fondamentali della struttura del
microelaboratore e del suo funzionamen-
to. Dal capitolo III è necessario pro-
cedere ad approfondimenti dell'aspetto
software che è la parte più importante
di qualsiasi sistema a microprocessore.
    La maniera migliore che consente una
comprensione totale della materia è quel-
la di poter disporre del microelaboratore
per verificare la teoria immediatamente
nella pratica.
    Passiamo senz'altro, quindi, alla descri-
zione del montaggio e collaudo del mi-
croelaboratore AMICO 2000A la cui sca-
tola di montaggio (o la scheda montata
e collaudata) è disponibile per chi fosse
 interessato presso la A.S.E.L. s.r.l. di Mi-
lano come meglio specificato alla fine
del libro.




20
```

## Pagina PDF 21

```text
                                                            CAPITOLO lii




 MONTAGGIO E COLLAUDO DEL MICROELABORATORE




                                                e la logica per il "reset" iniziale (74LS14       indirizzi': mentre la seconda, caratteriz-
L'architettura dell'Amico 2000A                 e 74LSOO).                                        zata dalle due cifre più a destra, è il
                                                   Zona memoria e decodifica: contiene            "display dati"
                                                2 K byte di memoria RAM ed I K by-                   Anche la tastiera è suddivisa in due
       on riferimento alla Fig. 8, nella        te di memoria PROM (Programmable                  zone fondamentali. La zona con i tasti
(      scheda del microelaboratore sono         Read Onlv Memory) che contiene il                 rossi è destinata all'introduzione dei dati
       chiaramente identificate diverse         programma di controllo del registratore            in codice esadecimale (tasti da 0 ad F)
zone che costituiscono i cosiddetti "bloc-      a cassette di cui si parlerà nel capitolo 5°.     mentre la zona con i tasti blu è invece
chi funzionali" dell'AMICO 2000A                   Nella stessa zona sono anche presenti          una tastiera di comando che permette
   Essi sono cosi suddivisi:                    le PROM di decodifica 74S287.                     di selezionare a piacere una particolare
   Zona CPU: contiene il microprocesso-            Tastiera e display: questo settore con-        funzione che si desidera eseguire.
re 6502 e l'elettronica di supporto come        tiene un display a sette segmenti a 6                Input/Output (110): in quest'area risie-
l'oscillatore (74LS14), la logica per il        cifre diviso in due zone, la prima delle          de un integrato LSI dotato di 3 porte
funzionamento in single-step (74LS38)           quaii, composta da 4 cifre, è il "display         da 8 bits ciascuna. Sono inoltre DTf""'"'nti




Fig. 8 - L'AMICO 2000/A montato. Le_ linee dividono la piastra in varie zone che corrispondono ai diversi blocchi.fimzionali del microcomputer.
                                 Pnma del montaggio è necessario familiarizzarsi con i vari componenti.

                                                                                                                                              21
```

## Pagina PDF 22

```text
                                                                                                     L'assemblaggio

                                                                                                            Dopo aver suddiviso i componenti in
                                                                                                        gruppi possiamo cominciare a assem-
                                                                                                        blare il nostro microcomputer a partire
                                                                                                        dai componenti passivi. Cominciamo ad
                                                                                                        identificare ed a dividere le resistenze.
                                                                                                            Esse possono essere suddivise in cin-
                                                                                                        que gruppi diversi a seconda del loro
                                                                                                        valore, riconoscibile attraverso la descri-
                                                                                                         zione riportata nella tabella 5.
                                                                                                            Effettuata anche questa ulteriore sepa-
                                                                                                        razione possiamo cominciare a piegare i
                                                                                                        terminali (reofori) delle resistenze. Una
                                                                                                        volta piegati i reofori inseriamo la prima
                                                                                                        resistenza al suo posto come mostra la
                                                                                                        Fig. 10, saldiamola e tagliamo la parte
                                                                                                        eccedente dei terminali. Ripetiamo que-
                                                                                                        sta operazione fino a che non abbiamo
                                                                                                        saldato tutte le resistenze presenti nel
                                                                                                        kit cioè da R 1 a R33.
                                                                                                            Terminata questa operazione passia-
                                                                                                        mo al montaggio degli zoccoli sui quali
            Fi~. 9 - Atrre::::a/llra indispensabile per il montaggio del microelaboratore.
          Racc;Jmam.'iamo .\a/datore e stagno di qualità perchè dalla bontà delle saldature
                                                                                                        verranno poi collocati i circuiti integrati
                  dipende in massima parte il successo di un buo funzionamento.                         più delicati. La saldatura degli zoccoli
                                                                                                        è molto semplice· occorre solo evitare
                                                                                                        che le saldature dei piedini adiacenti si
                                                                                                        tocchino, creando in tal modo dei dan-
                                                                                                        nosi cortocircuiti.
                                                                                                            Per effettuare un corretto montaggio
degli integrati di decodifica e pilotaggio pericolosi contatti cortocircuitanti. Rac-                   degli zoccoli, che sono molto importanti,
dei display (74LS145 e ULN2003).                      comandiamo anche di utilizzare del filo           consigliamo di inserirli tutti curandone
    I transistori TR2 + TR7 vengono uti- di stagno sottile, con un diametro di un                       l'orientamento. L'orientamento dello
lizzati per l'accension~ sequenziale del di- millimetro o poco più. In particolare zoccolo è lo stesso che dovrà avere l'in-
splay. In quest'area è anche presente consigliamo il tipo con flussante interno.                        tegrato, ed il riferimento è un angolo
una contattiera con 8 linee di input/                      È anche necessaria una normale pin-           smussato internamente in corrisponden-
output ~fruttabili per comunicare con zetta a becchi piatti e sottili, ed un tron-                       za del piedino 1, mentre sull'integrato
l'esterno.                                             chesino in mancanza del quale potete al          a questo piedino corrisponderà una tacca
                                                       limite usare un tagliaunghie (ma non le           e/o un punto chiaro.
    Interfaccia Cassetta: questa zona è                forbici!).
già predisposta fin da ora per montare                                                                       La Fig. 11 illustra la corrispondenza
                                                           Infine, per il collaudo del buon mon-         tra orientamento dell'integrato e dello
dei componenti che permettono di realiz-               taggio, sarà molto utile un normale tester,       zoccolo~ l'angolo smussato dovrà essere
zare una interfaccia per registratore a cas-           con il quale controlleremo le tensioni
setta. Ciò consentirà la memorizza-                                                                      in  corrispondenza deila tacca che identi-
                                                       di alimentazione e la continuità delle            fica sulla serigrafia la posizione dell'in-
:z;ione di programmi e dati e la loro lettura          piste, per verificare l'assenza di eventuali
ad alta veloçità.                                                                                        tegrato.
                                                       cortocircuiti o interruzioni (vedi Fig. 9).           Cominciamo ad inserire gli zoccoli
    Alimentatore: comprende un regola-                     Dopo esservi accertati che nella scatola      per gli integrati ICI (40 piedini, IC2 (14
tore integrato (TRl) che stabilizza la di montaggio siano presenti tutti i compo-                        piedini), IC3 (14 piedini), IC4 (14 piedini),
tensione a 5 Volt Sull'ingresso è previsto nenti riportati nella tabella 4 vi consiglia-                 IC5 (14 piedini), IC6 (16 piedini), IC9
un diodo in serie che viene utilizzato                 mo di suddividerli in gruppi, omogenei,           (24 piedini), ICI I e ICI2 (18 piedini),
per protezione contro inversioni di po- raggruppando tutte le resistenze, i diodi,                       ICI5 (40 piedini), IC16 e ICI 7 (16 pie-
larità.                                                i transistori,. i condensatori e gli altri . dini), IC18/l-2-3-4-5-6 (14 piedini) sal-
    Analizzata in questo modo la funzione              integrati.                                        dandoli uno per volta e verificandone
dei diversi "blocchi funzionali" presenti                   Occorre prestare una notevole at-            il corretto orientamento. In pratica vanno
sulla piastra e tjconoscibili anche sullo               tenzione ai circuiti integrati che sono          montati tutti con l'angolo interno smus-
 schema elettrico possiamo ora passare al-              forniti su un supporto conduttore di pro- sato verso l'alto.
 l'effettivo montaggio del microcomputer.               tezione. Vi consigliamo di .maneggiare               Finita questa operazione, e dopo es-
                                                        il meno possibile questi componenti e            serci accertati di non aver creato dei
                                                        di estrarli solamente quando dovete mon-         contatti tra piedini adiacenti, possiamo
                                                        tarli sul circuito s~mpato.                      passare al montaggio dei tasti. Facendo
                                                            Queste precauzioni coi circuiti integra-     riferimento alla Fig. 1U inseriamo i tasti
 Il montaggio                                           ti sono necessarie  perchè l'elettricità stati-  nella  loro rispettiva posizione, voltiamo
                                                        ca che si accumula sul corpo umano               la piastra e saldiamo in un primo momen-
                                                        potrebbe danneggiarre irreparabilmente i         to un solo piedino per ogni tasto. Senza
    Per assemblare correttamente il vostro              componenti MOS.                                  tagliare nè piegare i piedini ricapovolgia-
 AMICO 2000A occorre disporre innanzi-                      Raccomandiamo pertanto il montag-            mo la piastra e verifichiamo che i tasti
 tutto di. un saldatore da 20 - 30 W                    gio a persone che abbiano un minimo              siano tutti ben appoggiati sullo stampato~
 con una punta nuova e sottile, in modo                 di esperienza nella saldatura di drcuiti         eventualmente ritocchiamo le saldature
 da effettuare saldature precise evitando integrati.                                                     di quelli malposizionati, dopodiché,

'22
```

## Pagina PDF 23

```text
quando siamo ben sicuri che tutto è in
ordine, procediamo ·alla saldatura dei re-
stanti piedini.
   Nell'eseguire questo montaggio ricor-
datevi che· i tasti, pur non essendo dei
circuiti elettronici, temono il calore pro-
lungato essendo composti di materiale
plastico.
 · Terminato l'assemblaggio delle tastie-
re possiamo cominciare a montare diodi
(D 1-2-3 e lo Zener 08) e transistori. Per
i primi il riferimento è .una fascetta colo-
rata che contraddistingue il catodo (an-
che qui pertanto il necessario rispettare
la polarità seguente seguendo l'orienta-
mento della serigrafia mentre per i tran-
sistori (montiamo inizialmente solo i
TR2-3-4-5-6-7) possiamo fare riferimen-
to alla Fig. 12 per una corretta disposi-
zione dei piedini.
ci al gioco dei riflessi, diciamo che chi
ferma il display su cifre comprese fra 30
e 40 ha i riflessi molto buoni, fra 50 e
70 sono normali, mentre oltre i 100...
è meglio cominGiare una cura di Gero-
vital!
 Tabella 4 - Componenti e materiali .dell'
 AMICO 2000/A 'nella versione minima con·
 1 k byte di RAM e,senza l'interfaccia per
 registratore a cassetta.

  6        resistori 3,9 kQ
  6        resistori 10 kQ
  1        resistore 220 kQ
  7        resistori· 4,7 k
  7        resistori. I 00 Q
  6        resistori 1,2 kQ
  2        c_ond. elettrolitici 47 µF - 16 VI
  2        cond. elettrolitici 1 µF - 16 VI
  1·       cond. ceramico a disco 10 pF
  3        condensatori a disco 47 nF
           oppure -mo nF
  l    : · diodo 1N4001
  2        diodi 1N414S
  I       diodo J:l'IH.'. r 6.2 \'-1 ' 2 \\
  1    regolatore· LM 340 T5
       oppure µA 7805
  6    transistori BC 327
  1    microprocessore 6502
  2    integrati 74LSOO
  1    integrato 74LS14
  l .   integrato 74LS38 oppure 74LS03
  1    integrato 748287
  1    integrato. 93448
  2    integrati TMS4045 oppure 2114
  1    integrato 8255
  1 .. integrato 74LS145
  1    integi:ato ULN2003
  6    display LED TIL312
       oppure MAN72
  1    quarzo 1 MHz
  1·   interruttore unipolare
  23   tasti .    ·
  6    piedini di gomma
  1    dissipatore per T0220
  2    capicorda· ·
  1    contattiera a 10 posti
  2    zoccoli a basso profilo da 40 piedini
  1 .. zoccolo a basso profilo da 24 piedini
  2    zoccoli a bas~o profilo da 18 piedini
  3    zoccoli a basso profilo da 16 piedini
  10   zoccoli a bass·o profilo da 14 piedini
  1    circuito stampato a doppia faccia
       in vetronite
       forato e serigrafato
       300 mm x 100 mm
```

## Pagina PDF 24

```text
                                                                                                      positivo del tester sul punto w prova TP2
                                                                                                      nel quale dovremmo misurare una ten-
                                                                                                      sione compresa tra 4,8 e 5,2 V.
                                                                                                         Se questi controlli non hanno date
                                                                                                      risultato positivo verificate di non aver
                                                                                                      messo in cortocircuito con saldature mal-
                                                                                                      destre delle piste o dei piedini. Se in
                                                                                                      TP2 avete trovato una tensione superiore
                                                                                                      a 5,2 V, con grande probabilità l'errore
                                                                                                      è nel montaggio del regolatore TRl. Se
                                                                                                      invece la tensione è O, o comunque
                                                                                                      molto bassa può trattarsi sia del regola-
                                                                              Serigrafia
                                                                              sullo stampato
                                                                                                      tore che di un cortocircuito. Potrebbero
                                                                                                      anche essere i condensatori elettrolitici
                                                                                                      montati al contrario, basterà toccarli: se
                                                                                                      scaldano parecchio dissaldateli e sosti-
                                                                                                      tuiteli con dei nuovi.
                                                                                                         Attenzione: non proseguite sino a che
                                            Angolo
                                            smussato                                                  non avete trovato le tensioni corrette!



                                                                                                      Completamento del montaggio

                                                                                                         Dopo aver naturalmente tolto tensione
Fig. 11 - È indispensabile, per evitare dannose inversioni, montare gli zoccoli con lo stesso         provvediamo ad inserire nei loro zoccoli
orientamento (ovvero tutti con l'angolo interno smussato verso l'alto) degli integrati da inserire.   gli integrati IC2, IC3, IC4 ed IC5, che
Il disegno mostra la corrispondenza fra "tacca di riferimento" dell'integrato e "angolo interno       hanno 14 piedini, ponendo la massima
smussato" dello zoccolo.                                                                              attenzione all'orientamento (vedere
                                                                                                       Fig. 10). Controllate che tutti i piedini
                                                                                                      siano ben inseriti nello zoccolo e che
                                                                                                      l'integrato sia ben fermo nel supporto
                                                                                                      (vedere Fig. 16).
timi condensatori bisogna prestare at-               che andrà collegato ai due capicorda                 Inseriamo successivamente gli inte-
tenzione alla polarità, che è riportata              che si trovano sulla piastra. Chi non            grati IC6, IC16 ed ICI 7, a 16 piedini, e
sull'involucro dello stesso e sulla serigra-         dispone di questo alimentatore può co-           montiamo subito dopo IC9 a 24 piedini.
fia dello stampato.                                   struirselo secondo lo schema di Fig. 14,            I quattro integrati rimanenti sono tutti
    Concludendo il montaggio provve-                  oppure acquistare il kit di montaggio.
diamo a saldare anche il TRl, che ri-                    Per questo primo collaudo occorre
chiede anche il dissipatore fornito con              inoltre un comune tester, col quale co-
il kit (vedere Fig. 13 ).                            minciamo a controllare la tensione esi-
    Montiamo e saldiamo inoltre l'inter-             stente tra il punto di prova TPl e la
ruttore SS e la. contattiera a 10 posti per          massa (d'ora in poi faremo riferimento
le uscite digitali, ed anche i due capi-             alla fotografia di Fig. 15). Dopo aver per-
corda per l'alimentazione. Da ultimo                 tanto posizionato il puntale positivo ros-
saldiamo i~quarzo Ql che va assicurato               so in TPl e il puntale negativo sul punto
allo stampato con un pezzetfo di biade-              "massa" misureremo la tensione: se que-
 sivo (vedere Fig. 13), che funge anche da           sta è compresa tra 7 ,5 e ·12 V (se la
isolante tra il corpo metallico del quarzo           tensione è superiore agli 11 V fate at-
e le piste sottostanti.                              tenzione alla temperatura di TRl ed
                                                     eventualmente limitatela aumentando le
                                                     dimensioni del dissipatore) allora tutto            Fig. 12 - Disposizione dei piedini del transi-
                                                     è regofare e possiamo spostare il puntale           store BC 328.
Un primo collaudo

                                                       Tabella 5 &- " IDENTIFICAZIONE ' DELLE RESISTENZE CONTENUTE NELLA
                                                       SCATOLADIMONTAGGIODELL'AMIC02000/ASECONDOILCODICEACOLORI
   A questo punto mancano ancora gli
integrati ed i display, che andranno in-
seriti negli zoccoli.                                  :Valore                                        "Codice colore
   Prima di inserire questi delicati com-
ponenti è opportuno effettuare una pro-                                     1 colore            2 colore ,             3 colore           4 colore
va preliminare che ci permetta di con-                    3,9 kQ            arancio             bianco                   r9sso            oro
statare l'effettiva assenza di cortocircuiti.             4,7 kQ            giallo              viola                    rosso            oro
Per effettuare questo primo collaudo è                   10 kQ              marrone             nero                     arancio          oro
 necessario disporre di un alimentatore,                220 kO       ~

                                                                            rosso               rosso                    giallo           oro
 anche non stabilizzato, in grado di ero-                22 kO              rosso               rosso                    arancio          oro
 gare una corrente di circa un Ampere                   150     Q           mai:rone            verde                    marrone          oro
                                                          l.2 k Q           marrone             rosso                    rosso            oro
 ad una tensione compresa tra 8,5 e 12 V,

24
```

## Pagina PDF 25

```text
basati sulla tecnologia MOS e, come              sempre non perfettamente perpendicola-                   i display (IC18/l-2-3-4-5-6) che devono
abbiamo detto in apetura, vanno maneg-           ri, ma leggemente divergenti, e talvolta                 essere orientati col punto decimale verso
giati con particolare cura essendo molto         non consentono un facile inserimento                     il basso (lato tastiera).
delicati .                                       nello zoccolo.                                              Montati anche questi ultimi compo-
   È consigliabile estrarli uno alla volta          È consigliabile renderli perpendicolari               nenti e dopo aver dato un'altra control-
da supporto conduttivo cd inserirli nel          facendo leva sui due lati minori ed ap-                  lata generale alle saldature, siamo ora
loro /<ll'L"oln. L'crcando lii non rn;1nipo-     poggiando la fila di piedini su un piano,                pronti per dare tensione e passare al
larli inutilrncntc.                              possibilmente metallico. Vedere per                      collaudo finale.
   Montiamo nell'ordine l'IC 15, l'ICI L         questa operazione la Fig. 17.                               Colleghiamo l'alimentatore, posizio-
l'IC 12 cd infine l'ICI. Particolare cura           Abbiamo in questo modo completato                     niamo l'interruttore SS verso sinistra
tbvni essere posta nell'inserimento degli        il montaggio di tutti gli integrati e per                (posizione di funzionamento normale) e
integrati a 40 piedini. che sono fragili.        concludere l'assemblaggio del nostro mi-                 premiamo una volta il tasto RES (reset,
   I piedini degli integrati sono quasi          crocalcolatore ci mancano solamente                      cioè azzeramento iniziale). A questo




        1                 RDY
        2                  ~                             R1
         3                'W5
                                                                                                   POC
        4                  ~
        s                 SYNC                                                          ((
                                                                                                   Poe
        6                  ~
         .,               .82                  RESETi
                                                                                                                +5
                                                                                                                                               RDY
         a                  v                                                                                       8               2
        9                 RW                                                            R2         40                                     25
                                                                                                                                               ll/5
        10
        (f
                            v
                           RS
                                                                            IRQ
                                                                                                   4
                                                                                                   '1
                                                                                                                                          24
                                                                                                                                          23
                                                                                                                                               Rf4
                                                                                                                                               Rf3
        f2                  ~
                                                                                                                                          22
                                                                                                                                               R f2
        13                 FH                                                                                                             20
                                                                                                                                               R lf
        f4                 Rfl/                                                                                                           19
                                                                                                                                               RfO
        15                 Df                    R3                                           R4                                          18
                                                                                                                          ·1                   A9
                                                                                                   6                                      11
        16                 D/3                                                                                                                 R8
                                                                                                                         CPU              16
        (7                 R3                                                                                                                  117
        f8                 R2           HRLTZ                                                                                             15
                                                                                                                                               R6
                                                                                                                                          f4
        f9                 D3                                                                                                                  R5
                                                                                                                                          f3
        20                 D2                                                                                                                  R4
                                                                                                                                          12
        21                 R5                                                                                                             11
                                                                                                                                               R3
        22                 R4                                                                                                                  R2
                                                                                                                                          fO
                                                                                                                                               Rf
        23                 DS                           ws                                                                                9
        24                 04                                                                                                                  Rff
        25                 R7                           .d2
                                                                                                         26    2~   28
        26                 R6
                                                                                                        03
        27                 07                                                                                O~ 06 DS D4 D3 02 Df   O;!
        28                 06
        29                 R9
        .30               R8
        31                Rl4
                                                                               DIS
        32                Rf5
        33                fJff                                         DI
                                                                                                                    2
        34
        35
        36
        37
        38
                          flf0
                          1112
                          IU3
                          ffEt15EL
                          Nf1/
                                                                          Cl   r             TR 1                                         +5
                                                                                                                                          08



        39                IRQ
        40                 POC

     Segnali   del connettore




                Schema elettrico J" blocco: CPU e regolare 5 Vcc. Sulla sinistra 1 Wf?nali presenti al connettore (zona espansione).


                                                                                                                                                      25
```

## Pagina PDF 26

```text
N
(j,)   .    ws
            R9
            R8                            +5        I                     r-+-4·+5
            R7
                                                             I            18 19              119              IO              R91          IO                           IO                  R9            IO
            R6                                                                                  15                                  15                                                           115
                   R8                                   RB 23                                R8 16                                                                                          R8 il6
            R5          23                                                                                                          16
                   FU ~                        D~       R7                                   fl? f1.                          Rl f1-
            R4                            O·                     I                                                                                                                          R1 1n
                   R6                          06        6 2                                 R6                               R6 f                                                          R6 I f
            R3        2.                  16                                                     1
                   R5                     15 DS         FIS                                  R5                               R5 2.                                                         RS ·
            A2        3                                          .3                             2                                                                                                ,2
            RI
                   R4            9           D4         R4                10                 R4 3              fl             R4 3          f2                           13                 fl4 3           14
                      4                   14                 f   4
                   R3                        D3     R3                                                                        Fl3 ,4                                                        R3
            Rfl(      5                   13                                                 R3 ,4                                                                                              4
                   R2 6                      D2     R2                                       R2 7-                            R2 i                                                          R2. 1
                                          Il
                   RI f.                       Df   Rf                                       IH                               R1                                                            Rf
                                          IO                                                       6                                6
                                                                                                                                   '"                                                            6
                   ~8                     9 D       Fii                                      R 5                        8     R 5                     8
                                                             li                                                                                                                    8             5                      8
                           20'       21                              20                                14 13 f2 {f                      14 13 f2 Il                  14 13 12 Il                      14 13 12 f( •
                                                                                                       ~ 011 D21 D3I                D41 osi 061 oJI                D,61011D~03,                  D4    I051 D61 /J ìl
           Dr
           06-
                                                                                                                                                                                       (f
            D5
            04
            D3
           D2                                                                                                       ~+5                                                       ~~5
                                                                                            est                                                              css
           Di
           D/I

           RS




                                                                                  R/5                               I                                              CSJ _ _f
                                               12                CS4                    15               12             CS8
                                                                                  fl/4 1                                                                                   2
                                               11                CS5                                     ff         - C5'/                                         C.52 - -
                                                                                  R/3                                                                                      3
           Rf5                                 IO                C52                  2                  IO             CS6                                        CS5
                                                                                  Rl2
           Rl4                                 9                 CS1                  3                  9              CS3                                        CS4
                                     6                                            Rff          '1                                                                         11 I R P2---ttE115EL
           Rl3                                                                          4                                                                          C53--
                                                                                  RIO
           Rl2                                                                        7                                                                            CS6 ~
                                                                                  R9                                                                                    6
           Rlf ·                               13                                     6                 -13                                                      C57 - -
                                                                                  RS                                                                                   5
           RIO                                 f4                                       5               14                                                       CS8
           IJ9
           RB

                                                                                                                                                      Schema elettrico 2· blocco: memoria, ed elettronica di decodifica.
```

## Pagina PDF 27

```text
                                                                                                     stiera esadecimale (rossa) nel display
                                                                                                     dati; premiamo 0000 (apparirà 0000 nel
                                                                                                     display indirizzi), e premiamo il tasto
                                                                                                     I DA I . Ripetiamo ora l'operazione già
                                                                                                     svolta precedentemente, premendo uno
                                                                                                     alla volta i tasti rossi da 0 ad F. La cifra
                                                                                                     corrispondente entrerà nella posizione
                                                                                                     più a destra de] display dati. Premiamo
                                                                                                     ora il tasto  IIJ ;  ad ogni pressione il
                                                                                                     display indirizzi si incrementerà di uno
                                                                                                     (ricordati sempre che in esadecimale
                                                                                                     VfJ+ 1 = 0A e che 0F +1 = 10!): Ancora
                                                                                                     una volta durante questa operazfone il
                                                                                                     display dati varierà in maniera casuale.
                                                                                                     Se teniamo premuto il tasto [fJ il di-
                                                                                                     splay indirizzi si incrementerà di uno
                                                                                                     una volta al secondo. Consideriamo ora

                                                                                                     il tasto I REG   J   ,   del quale esamineremo

         Fig. 13 - Particolare dissipatore del rcgoiatore TR I e del montaggio dcl quar::.o          in seguito la specifica funzione operativa.
                                      con il hiadcsirn isolante.
                                                                                                       Premiamo il tasto I AD I e poi i tasti

                                                                                                     00 F6, quindi il tasto I DA I e 9E; succes-
punto dovreste vedere il dispaly acceso,               A questo punto, dopo aver corretto gli        sivamente pigiamo [J] (comparirà nel di-
mostrando delle cifre e/o lettere che              eventuali errori, ripetete il ciclo di collaudo
restano immutate se non si toccano i               finale.                                           splay indirizzi 00 F7) ed i tasti 01. A que-
tasti. Le prime 4 cifre da sinistra (cor-              Se ancora una volta non ottenete i risul-
rispondenti al display indirizzi) devono           tati previsti vuol dire cheavetefatto qualche     sto punto si preme il tasto REU\. Nel di-
 essere 0000, mentre le altre due devono           errore e vi consigli.amo di rimettere tutto
essere due qualsiasi caratteri esadecimali.        nella scatola e di spedirlo al servizio a$si-     splay indirizzi deve apparire 019E (cioè i
Per aiutarvi a riconoscere i caratteri del         stenza tecnica della A.S.E.L.                     dati appena introdotti) mentre il display
display fate riferimento alla tabella 8.              .A questo punto, se tutto è a posto, pre-
                                                                                                     dati conterrà un numero casuale.
     Se il display rimane spento o se le ci-       nuamo uno per volta i tasti esadecimali              Effettuiamo ora la prova del tasto
 f 1e continuano a cambiare significa che          (tastiera rossa). La cifra corrispondente
 qualcosa non è a posto; conviene togliere         al tasto premuto deve entrare nella posi-
 l'alimentazione e controllare metodica-           zione più a destra del display indirizzi
                                                                                                     [:HIIJ , premendo il quale il display
 inente l'orientamento degli integrati, dei        cioè quello a 4 cifre. Durante quesu;
                                                                                                     si fermerà mettendo in evidenza una ci-
 transistori e dei display; ricontrollate an-      operazione il display dati cambia in ma-
 che le saldature, cercando eventuali con-         niera casuale.                                    fra a caso illuminata in modo piuttosto
 tatti, fonti di corto circuiti.                       Controlliamo ora l'ingresso della ta-         intenso (potrà capitare anche che il di-
                                                                                                     splay rimanga spento, ma non preoccu-
                                                                                                     patevi, premete di nuovo [RE~ (reset

                                                                                                     e poi ancora [H~T_J ).

                                                                                                        In questo modo abbiamo collaudato

                                                                                                     tutta la tastiera, tranne il tasto [:RUN],

                                                                                                     che proveremo facendo eseguire il nostro
                                                                                                     primo piccolo programma, in modo da
                                                                          C1 +     C2                verificare funzionamento globale nel
                             9Vac                                                                    nostro sistema.
                                                                              2200      0,1
                                                                              pF        pF
                                                                  K led                              Introduciamo un primo programma

                                                                                                        Riprendendo quanto avevamo esposto
                                                                                                     nel secondo capitolo passiamo ad effet-
                                                                                                     tuare la somma di due numeri esadeci-
                                                                                                     mali. Per comprendere bene la funzione
                                                                                                     dei tasti che useremo facciamo riferimen-
                                                                                                     to alla tabella o.
        Fig. 14 - Schema dell'alimentatore da 1 A per il microcomputer AMICO 2000A.                     La tabella 7 mostra la sequenza di tasti
                Questo alimentatore è anche disponibile in scatola di montaggio.                     che bisogna premere ordinatamente per

                                                                                                                                                 27
```

## Pagina PDF 28

```text
I\.)
CXl




                                            I/O                                                                           OIS
                                            ../\                                                       +5V
                       /ofi 01 02 03 04 05 06 or'
                       14   f5 16   f7 13           12    ff   IO                                                            9
                                    i.;:,                                                                             (          . f6
                                                                          4
       07 - - - ·
                                                                                                                      2          I   f5
                                                                          3
       D6
                                                                     .2                                               3              14
       05                                                                                                                            f3
               30                                                         f                                           4   I 'l
       D4                                                                                                                            12
               31                                                         40                                          5
       03
                                                                          39                                          6              u
       02    __g_
            33                                                                                                                       IO
                                                                      I   38
       DI
            34                               f5
       Dfl'                                                                                                                  a                     lf    2 7 81 IOI 131 f
        - --
       l?S  5
                                                                      ~f9      15                                                             3
       WS      3ti I                                                                                                                                     .D15PLRY I
                                                                                                                                              l4
       C52.~                                                                                16
       Poe     35 i                                                   ~12                                                                          ti    2 7    8 IO 13     f
                                                                                                                                                               -      -··


                                                                        l                                                                                DISPLRY 2
        ('1---                                                                      lff l'o 1911   r!
       Rf
                             I I Il I I I
                                               +5                                                                                                  f{l 2l 1l.al 1ol 1311
                                                                    L                                                                                    DISPLAY 3
                                                         I I
                                                                    R39
                                                                    CJ----,                                            +51
                                                                                         RE<:t                        ~                            11l 2I zl §I 101131 1
                                                                                          IN
                                               R.3811                           I IR4f                                                    !              DISPLRY 4
                                                                                                                                          I
                                                                                                                                          I




                                                                                                               ~ECt
                                                                                                               OUT
                                                                                                                                                         DlSPLRY 5
                                                                                                   '     '   o--~
                                                                                                         L-~~-j
                                                                                                                                                   111   2l 7l sl 1ol 13I
                                                                                                        C8
                                                                                                                                                         D/5PLRY6
                                                                                                                                                   --
                                                                                                                                                   DIS



       Schema elettrico 3° blocco display, tastiera, inteifaccia cassetta e parte !IO.
```

## Pagina PDF 29

```text
          Fig. I 5 - Piastra montata senza integrati inseriti. Controllare che sul punto di prova !pi sia presente una tensione compresa
                                         fra 7,5 e I 2 V e su tp2 una tensione compresa fra 4,8 e 5,2 V.




c~ricare il programma in memoria, e              che non occorre un microelaboratore per                 ma), e quindi premere il tasto [ R@l,
mette anche in evidenza il corrispondente        effettuare una simile operazione, e che                 che farà eseguire il programma a partire
movimento dei dati sul display.                  comunque l'intera procedura è molto                     dalla istruzione 000 A.
  Si noti che xx sta per numeri o lettere        complessa, ma non disperate; siamo ap-                    L'esecuzione del programma richiede
qualsiasi. Si veda inoltre la tabella 8 che      pena agli inizi e questo programmino                    solo una piccolissima frazione di secon-
mostra come vengono rappresentate cifre          banale ha una sua precisa funzione di-                  do (un microelaboratore come i'AMICO
e lettere nel visualizzatore dcl micro-          dattica e di collaudo!                                  2000A è infatti in grado di eseguire me-
computer.                                            Per eseguire il programma non ci resta              diamente 200 mila istruzioni al secondo)
                                                 altro che indicare al nostro Amico 2000                 e apparentemente per voi non sarà cam-
                                                 l'indirizzo nel quale inizia il programma               biato nulla, poichè il display non è cam-
L'esecuzione del programma                       stesso e quindi dare il via all'operazionP              biato.
                                                  Basterà pertanto premere · A5 OOOA (sul                   L'operazione di somma è però stata
                                                 display dati troveremo 18, che è proprio                eseguita ed infatti il risultato potrà essere
   Il programma che abbiamo appena                                                                       letto nella posizione di memoria
                                                 la prima istruzione del nostro program-
finito di introdurre in memoria ha la
funzione di sommare i due numeri pre-
senti nelle- locazioni di memoria 0006 e
Vl/J07 mettendo il risultato di questa ope-
razione nella locazione di memoria 0004.
    Prima di eseguirlo dovremo pertanto
introdurre nelle locazioni 0006 e W/J07
i due dati che vogliamo sommare. Per

fare ciò premiamo [AD -I 0006 e I DA i
                                                                   .•
                                                                   I
                                                                       ,-,-,,,,,
                                                                       -




03; in tal modo avremo introdotto nella
locazione 0006 il dato 03 (cioè il numero
3 in esadecimale, che corrisponde al 3
decimale). Successivamente premiamo

[I] e 02, con l'effetto di introdurre il
numero esadecimale 02, (corrispondente
a 2 in decimale) nella locazione di me-
moria 0007 (infatti la funzione del tasto

[]è, come abbiamo già detto, quella
di incrementare di uno il contenuto del
display indirizzi, che sarà passato per-
tanto da 0006 a 0007).
   Dopo aver inserito questi dati l'opera-
zione che effettivamente ci accingiamo
ad eseguire è 2+ 3. Probabilmente qualcu-
no di voi sarà deluso, essendo evidente                Fig. 16 - Integrato inserito nello :::ol'Co/o. Verifìcare che /lilli i piedini siano hen inseriti
                                                                                                                                                           29
```

## Pagina PDF 30

```text
                                                                                                                  0004. Per vedere il contenuto di questa
                                                                                                                  posizione di memoria premiamo I AD-:
                                                                                                                  e poi 0004~ nel display dati apparirà 05,
                                                                                                                  che è appunto l'atteso risultato della
                                                                                                                  somma 03+02.
                                                                                                                      Con questo programma possiamo
                                                                                                                  dunque eseguire delle somme di due
                                                                                                                  numeri di 8 bits (valore massimo in
                                                                                                                  decimale = 255). Per somme di numeri
                                                                                                                  maggiori di 255 occorre scrivere un pro-
                                                                                                                  gramma un po' più complesso. Questi
                                                                                                                  programmi sono ad esempio già presenti
                                                                                                                  in partenza nelle ROM delle calcolatrici
                                                                                                                  tascabili, pertanto essi non richiedono
                                                                                                                  l'operazione di inserimento manuale dei
                                                                                                                  programmi stessi, che invece dobbiamo
                                                                                                                   effettuare con i'AMICO 2000A. Questo
                                                                                                                   non è in realtà un grande svantaggio perchè
                                                                                                                  aggiungendo qualche integrato come ve-
                                                                                                                   dremo nel quinto capitolo sarete in grado
                Fig. J 7 - Particolare della piegatura dei piedini dei circuiti integrati che permette
                                                                                                                   di registrare i programmi su cassette ma-
                             un perfetto inserimento degli stessi negli appositi zoccoli'.      .                  gnetiche e di richiamarli quando vorrete,
                                                                                                                   saltando la fase di introduzione manua-
                                                                                                                   le. È comunque importante che vi ren-
                                                                                                                   diate conto della profonda differenza
        Tabella 6 - DESCRIZIONE DEI TASTI FUNZIONALI DELL'AMICO 2000                                               tra un elaboratore come questo ed una
                                                                                                                   calcolatrice normale, differenza che è
                                                                                                                   da un lato nella molto maggiore velocità
    Tasto             Definizione
                                                                                                                   di esecuzione (le calcolatrici tascabili
                                                                                                                   programmabili sono notevolmente più
            AD. I     AD = Address = Indirizzo
                                                                                                                   lente), ma che consiste soprattutto nella
    J




                      Permette di selezionare l'indirizzo della locazione di m~moria che si intende                flessibilità. Il microelaboratore AMICO
                      esaminare o modificare (si può modificare solo se si tratta di memoria RAM).                · 2000A infatti non solo potrà eseguire
                      Per introdurre l'indirizzo vengono utilizzati i tasti esadecimali (quelli rossi).            operazioni aritmetiche, ma sarà anche
                                                                                                                   in grado di controllare tutta una serie
    l DA I            DA = Dato
                                                                                                                    di strumenti, cosa che certo non può
                      Permette di modificare 'il contenuto di una locazione di memoria precedente-
                                                                                                                   fare una calcolatrice.
                      mente selezionata. Per introdurre il dato si utilizza sempre la tastiera esade-                  Vi ricordiamo peraltro che le applica-
                      cimale. Attenzione: non si possono modificare le locazioni di memoria non                     zioni tipiche dell'AMICO 2000A, come
                      coperte dalla RAM presente sul sistema. Nel caso del sistema minimo la RAM                    dei microelaboratori in genere, non sono
                      si trova compresa tra le locazioni 9999' e 93FF (1024ma locazione).                           tanto· orientate verso la sostituzione delle
                                                                                                                    tradizionali calcolatrici, ormai diffusissi-
     rn               Incremento indirizzo
                      Questo tasto permette di esaminare la locazion~ sucessiva a quella sulla quale
                                                                                                                    mè sul mercato, quanto piuttosto verso
                                                                                                                    applicazioni più flessibili ed evolute.
                      siamo posizionati. Nota bene: se l'ultimo tasto che abbiamo premuto prima del
                      rn  è I AD 1, i tasti esadecimali premuti dopo vengono introdotti nel display
                      indirizzi. Se invece l'ultimo tasto premuto prima di[}] è stato DA I , i valori
                                                                                              J




                      esadecimali introdotti saranno relativi al dato, ovvero al contenuto della locazione ci.i   lJn progralDIDa più co01plesso:
                      memoria aperta. Il tasto [I] non modifica la funzione precedentemente selezionata.
                                                                                                                  il gioco .dei riflessi


                      REG = Registro Program Counter                                                                 Tutto ciò che abbiamo fatto fino ad
                      Maggiori dettagli su questa funzione verranno spiegati nel corso della                      ora ci ha permesso di prendere confi-
                      trattazione.                                                                                denza con i comandi dell'AMICO 2000A
                                                                                                                  e soprattutto di comprenderne il funzio-
                      RUN =Via                                                                                    namento. Per trarre il massimo beneficio
                      Permette di iniziare l'esecuzione del nostro programma a partire dalla locazione            da ciò che faremo in futuro è indispen-
                      di memoria puntata dal display indirizzi.                                                   sabile aver bene compreso tutto quello
                                                                                                                  che abbiamo detto fino ad ora: questo
                                                                                                                  vi permetterà piano piano di essere sem-
                      HLT = Halt = Arresto                                                                         pre più indipendenti per ciò che riguarda
                      Genera una interruzione a livello CPU.                                                      la creazione di programmi originali, che
                                                                                                                  sono poi il "carburante" del nostro sistema.
.       1   RESI      RES = Reset = Azzerramento                                                                     Non vogliamo però togliervi il gusto
                      Permette l'inizializzazione del sistema all'accensione, visualizza la locazione di          di cominciare a giocare con il vostro
                      memoria 9999, permette di arrestare l'esecuzione di un programma utente in
                                                                                                                  microcalcolatore; abbiamo preparato per-
                                                                                                                  ciò un semplice programma composto
                      qualsiasi momento passando il controllo del sistema al monitor.
                                                                                                                   da 55 byte per trasformare il vostre
                                                                                                                  AMICO 2000 in una macchina per la prova

30
```

## Pagina PDF 31

```text
     Tabella 7 - PROGRAMMA PER ESEGUIRE UNA OPERAZIONE DI SOMMA .CON IL MICROELABORATORE

     Operaz. n.          Tasto da premere               Visualizzatore                                              Commento



     1                   I RESI                      0000.XX                  . · Az~erraniento iniziale.
I




I
I
     2                   lADI                        0000   xx                          AD = Address = indirizzo.
                                                                                        L'elaboratore. si prepara a ricevere un indirizzo di memoria.

                  ....

     3                   @] @] @] ~                  000A XX                            Insiirizzo di partenza, del programma.

li
     4                   JDAI                        000A XX                            DA = Dato; l'elaboratore si prepara a ricevere un dato da depositare
                                                                                        nella .locazione di memoria 000A.                                  ·
                                                                                                                                                         I




     5                   OJ []]             '
                                                     000A 18                            Il numero 18, che è il codice esadecimale della operazione CLC
                                                                                        (Clear Cai-ry), cioè azzerramento del riporto è entrato nella loca-
                                                                                        zione di memoria 000A.



     6                   rn                          000B XX                       :
                                                                                        L'elaboratore è pronto a ricevere un altro dato nella posizione· di
                                                                                        memoria successiva alla 000A.        ·     ·

                                                                                   j




     7                   ~ [I]                       000B A5                            Il numero A5, che è il codice esadecimale della istruzione LDA
                                                                                        (Load Accumulator) è entrato nella locazione di memoria 000B.



     8                   rn [QJ [§]             ..   000C 06                            06 è l'indirizzo di memoria del 1° addendo.

                                                                                                           ;


     9                   [I] [§] [I]                 '0ooD Q.5                          Jl numero 65 è il codice operativo . dell'istruzione ADC.                 .1+J


                                                -
     10                  rn @] [1J                   WJE 07                             07 è l'indirizzo di memoria del secondo addendo.



     11                  [I] ~ [I]                   000F 85                           · Il numero 85 è il codice operativo dell'istruzione STA.



                         rn [Q] lIJ
                                                                         '•

     12                                              00'i0 04                           04 è la locazione di memoria in c~ viene depositato il risultato
Il
                                                                              I•        della somma.



     13                  rn [!] [çJ                  0011 4C                            L'ìstruzione 4C corrisponde a JM~ = salto (1):.. .



     14                  tIJ [I] w                   0012 22                            Questo saìto '. serve a chiudere il programma ed a passare. il con-
                                                                                        trollo delle Qperazioni al Monitor, cioè al programma di gestion·e
                                                                                        interna del microcalcolatore. L'indirizzo al quale inizia questo
     15                  rn [f] . [fil               0013 FE                            programma interno, che risiede in P;ROM, è appunto FE22.~
                                                                                                                                                             I·




     Nota 1~ quando il programma arriva a questo punto, cioè quando trova una instruzione di .JMP (<'.odi.ce 4C), legge il contenuto
     delle due locazioni di memoria successive al 4C e lo utilizza come indirizzo da cui preleva la prossima istruzione da eseguire. In
     questo caso riprenderà l'esecuzione alfistruzione contenuta in FE22.                               ·   ·



                                                                                                                                                                  31
```

## Pagina PDF 32

```text
                                                                                                      Tabella 8 - Corrispondenza fra caratteri a set-
                                                                                                      te segmenti (quelli dei display) e numeri esa-
                                                                                                      decimali.


                                                                                                                I I
                                                                                                                    I   -,      =    ~
                                                                                          ...w
                                                                                          Cl)                               I
                                                                                          e                             I       =    1
                                                                                          o
                                                                                                                            I
                                                                                                                I               =    2

                                                                                                                            I
                                                                                                                                =    3
               Fig. 18 - Serigrafia· e traccia del circuito stampato de/l'alimentatore ~a 1 A.                          I

                                                                                                                    I I
jei riflessi. Questo semplice programma
può così cominciare a far parte della vostra
                                                       ancor [I] 2A e così via premendo sem-
                                                                                                                      I         =    4
biblioteca e al momento opportuno potre-               pre il tasto [I] prima di introdurre i dati
mo anche registrarlo su cassetta magnetica
per introdurlo automaticamente nella                   fino all'ultimo che si troverà nella loca-                   ì
memoria RAM dell'elaboratore.                          zione di memoria 0 236.                                          I       =    5
   Per questa volta non preoccupatevi                     Ora torniamo alla locazione di memo-
di capire ciò che state introducendo,
ovvero il significato delle varie istruzioni
ma cercate di comprendere la funzione
e il perché dei tasti usati.
                                                       ria 0200 premendo IAD I 0200, quindi
                                                       premiamo successivamente [[]tante vol-                   I   -,
                                                                                                                    I
                                                                                                                                =    6
   Come introdurre il programma: ac-
cendiamo la macchina, premiamo il tasto                te quanti sono i dati introdotti verificando
                                                                                                                            I
1

    _1_l_ES j poi [_~J)_j e introduciamo l'indi-
                                                       la corrispondenza fra ciò che appare sul
                                                       display e la lista del programma.                                I       =    7
                                                          Nella tabella 9 è riportata la lista del
rizzo della locazione di RAM dalla quale               programma: sulla. sinistra le prime quat-
                                                       tro cifre indicano l'indirizzo che deve                   I I
partirà il nostro programma ovvero 0200,
                                                       essere presente sui quattro digit del di-                I I             =    8
quindi premiamo !D~Aj , A5, poi !fl , F9,              splay indirizzi e sono riportate ogni

                                                                                                                    I I
                                                                                                                      I         =    9


                                                                                                                I I
                                                                                                                    I   -, =         A

                                                                                                                    I
                                                                                                                I I
                                                                                                                                =    B


                                                                                                                    I
                                                                                                                I
                                                                                                                                =    e
                                                                                                                            I
                                                                                                                I I             =    D

                                                                                                                    I
                                                                                                                                =    E
                                                                                                                '"-·
                                                                                                                    I
                         Fig. 19 - L'alimentatore de/i'AMICO 2000/A montato.                                    I               =    F

    32
```

## Pagina PDF 33

```text
 tanto per verificare la corrispondenza
 con il display dell'AMICO 2000; le due                E:LENCO COMPON~NTrDELL'AMICO 2()00/ A
 cifre a destra rappresentano il contenuto
 (o ciò che dobbiamo introdurre) della
 corrispondente locazione di memoria                   Resistori (tutti da I 14 W, tolleranza 5%)
 selezionata e sono in definitiva le istru-          - Rl-2-3-4           lOkQ .
 zioni e i dati che immetiamo nell'elabo-              R5                220 kQ
                                                       R6.-7             10 kQ
 ratore in codice esadecimale.                         RS-9-10-ll -
     Dopo aver verificato che tutti i dati             12-13-14"         4,7 k \..
 siano stati introdotti correttamente pos-             RlS-16'-17-
 siamo far "girare" il programma. Per                  18-19-20-21 : 100 o
 far questo riportiamoci come abbiamo                  R22-240:26-
 fatto prima all'indirizzo 0200 quindi                 is-30-ai          1,2 kQ
 premiamo il tasto IRUN I: il display si              :R23-25-27-
                                                       29-31-33          3~~ kQ
 spegnerà per riaccendersi dopo qualche                R34-35-
 sec_ondo. Appena esso si riaccende bi-                36-37(1)          820
 sogna premere uno qualsiasi dei tasti                 R3su>             22kQ
                                                       R39(1)            1,8 kO
 rossi e sul display apparirà un numero
                                                       R40m              1,8 kQ
 proporzionale al tempo che è intercorso               R41<1>
 tra l'accensione del display e la pressione                1
                                                                         100 Q
                                                       R42< >            33 kQ
 del tasto. Chi ha i riflessi più pronti               R43<n             3,3 .kQ
 visualizzerà numeri più bassi.
     Ogni volta che si vuol far ripartire
 il programma basta premere RUN. Ricor-               Condensatori
 datevi però che iJ programma rimane                  Cl                  47 µF - 16 VI - elettrolitico
 registrato nella RAM solo quando il mi-              Ci                  47 µF - 16 VI - elettrolitico
                                                      C3-4                1 µF - elettrolitico
 croelaboratore è acceso; se, dopo aver               C5                  15 pF - ceramico a disco
 programmato e giocato, spegnete la mac-              C6-7(1)             6,8 nF - polistirolo     ,
 china il contenuto della RAM verrà                   c8(f)           :   1 nF - polistirolo·(Qpzionale)
 perso così che riaccendendola dovrete                C9-10-ll (1) _
  reinserire daccapo l'intero programma.              12<f1_13       :    0,1 µF - ceramico a disco (oppure 0,047 µF)
    A titolo di esempio, sempre riferendo-
                                                        Diodi
                                                        D1                1N4001
                                                     ''"D2-3              1N4148
                                                        D4-5-6-7(1)       diodi LED
                                                        D8                diodo zener da 6,2 V 112 W
 Tabella 9 - Programma per il gioco dei riflessi
                                                        Transistori
                                                        TRl               LM340T5 (opp. µA 7805)
INDIRIZZI         DATIINDIRIZZI              DATI     TR2-3-4
                                                      5~-7      :         BC ~27
  0200              A:,                        38
                    FS                      ·_ 85      Integrati
                    C.'.A                     FC       I Cl              650:Z - microprocessore CPU
                    6~>                        69      IC2               74LSOO - quadruplo NAND a 2 ingressi
                    F9                         DO      IC3           · 74LS14 - HEX Schmitt Trigger             ' .
                    29                         95      IC4               74LS38 (opp. 74LS03) - quadruplo NAND a 2 ingressi a collettore aperto
                    7F                         FC      ICS               74LSOO - qua4ruplo NAND a 2 ingressi
                                               E8      IC6<U             748287 - PROM 4i' decod.ifica (opp~re ?3427)
                    85                                 IC7             · 748287 ::: PROM di decodifica (oppure 93427)
                    FB                         DO      1cs<u             74LS30 -.NAND a 8 ingr.essi'
                    20                         F7      IC9               93448 . ..: PROM programma MONITOR (oppure 7 4 S 47 4)
                    EE:                        08      1c10<0            93448 - PROM gestione intelfaccia cassette (oppure 74 S 474)
                    FE                         2.n     ICll-12           TMS4045'(opp: 2114) RAM IK x 4 statica
                    DO                         oc      1Ct3-14<2>        TMS4045 (opp. 2114) RAM 1~ x 4 statica
                    FB                         FF      IC15              8255 - tripla porta I/O a 8 bit
                    E6                         FO-     IC16              74LSJ45 - decodifica display            .
                                               ED      IC17              ULN2003 (OP.,P• MC 1413) - driver displ~y LED .
                    FA                                "IC18-1-2':'3-
  0210              DO                         20
                                                       4-5-6             TIL312 ·-display LED a 7 segmenti
                    F7                         oc      1c19o)            LM358 - convertitore di ingresso per interfaccia ..~ cassetta magnetica
                    E6                         FF      1c20°>            74LS132 - quadruplo . NAND a 2 ingressi Schmitt Trigger
                                                             1
                     FB                                IC21< >           74LS38 - quadniplo NAND a due ingressi
                     DO                               ss                 interruttore uriipolare
                     F3      0230                      Ql                quarzo da 1 MHz
                     8~>
                                                       TASTI             2~ pezzi
                     Ft;i
                     A2
                     FD                                NOTE:
                     F8                                 (1) Questo componente viene fornito per completare il microcomputer AMICO 20000A con
                             0236
                                                        l'inteifaccia per il registrq{qre a cassette.

                                                       (2) Questi componenti vengono fomiti per completare la memoria RAM del!'AMICO 20001A.



                                                                                                                                                   33
```

## Pagina PDF 34

```text

```

## Pagina PDF 35

```text
                                                        CAPITOLO IV




                           IL SISTEMA DI INDIRIZZAMENTO




                                                          ~~----<I c = a Carry uguale a 0 all'ingresso della operazione.
La somma nel sistema binario
                                                 0 + 1 +0 = 1       c =a
                                                          T
                                                 1 + 1 +0 =0        C=
  Abbiamo già visto nel capitolo prece-
dente una operazione elementare, la
                                                 0+1+1=0
                                                          ..         I




                                                                     C=
somma binaria di due numeri. Le stesse
regole che ci permettono di eseguire
una somma nel nostro solito sistema
                                                          ..
                                                  1 +0+1 =0          C =      Carry intermedio.
decimale, sono usate nel sistema binario.            ..,             I




Inoltre nel sistema binario, dato che vi         0+0+1=1             c= 0
sono due sole cifre (lo 0 e l' 1) queste             ..,
regole sono ancora più semplici.                 0 +0 +0 =0          c =a
  Vediamole insieme e introduciamo il
concetto di "Carry":
                                                       ..,           I




                                                 0 +0 +0 =0          c = 0
0+0=0                Riporto (Carry) = 0               ..,           I




0 + 1=1                       Carry = 0          0 +0 +0 =0        Ic = a     Carry all'uscita dell'operazione.
1+0 = 1                         c =0
1+1=0                           c =1
   Assunte queste regole fondamentali           Notiamo che la somma di ogni cifra       2) Dello Status Register (P) aooiamo çte-
supponiamo ora di dover eseguire la          viene fatta tenendo conto anche del         finito solo il primo bit che è il Carry;
somma: 1 + 1 + 1.                            Carry. Se ora ritorniamo al nostro ela-     gli altri bit dello Status verranno analiz-
   Il risultato di questa operazione è 1     boratore ci chiediamo: dove sta fisica-     zati in seguito.
con il C = 1. Perchè?                        mente il Carry?                                Il microprocessore 6502 (la CPU del
   Scomponendo abbiamo: (1 + 1) + 1 =           Per rispondere dobbiamo introdurre        nostro AMICO 2000/ A) possiede alcune
0 + 1 con C = 1 (per via della somma         un nuovo registro presente nella CPU.       istruzioni che agiscono sul Carry. Le
1 + 1); ora 0 + 1 = 1. Il risultato della    Fino ad ora abbiamo incontrato i'AC-        principali sono:
intera operazione quindi è 1 e il c rimane   CUMULATORE,            il    PROGRAM        SEC; cioè SET CARRY FLAG. Que-
uguale a 1.                                  COUNTER e i'UNITÀ ARITMETICO-               sta istruzione mette a 1 il bit di Carry
   Utilizziamo queste regole per effettua-   LOGICA (ALU).                               (Set in inglese). La sua traduzione in
re la somma:                                    Il REGISTRO DI STATO (Status in          linguaggio macchina è 38.
0A16 + 0716 = 1116.                          inglese) è il nuovo registro che contiene   CLC~ cioè CLEAR CARRY FLAG.
(N.B. - Si tratta di cifre esadecimali).     alcune informazioni sul progredire delle    Questa istruzione mette a 0 il bit di
   Trasformandole in binarie abbiamo:        operazioni che il microprocessore sta       Carry (Clear in inglese). La sua tradu-
                                             eseguendo. Lo Status è formato da 8         zione in linguaggio macchina è 18.
0000      1 () 1 0 (0A)                      bit di cui il primo è proprio il CARRY.         Riprendendo l'esercizio interrotto pos-
0000      0 1 1 1 (07)                       Al momento attuale quindi la nostra         siamo dire che il Carry all'ingresso della
                                             CPU può essere rappresentata come in        somma può essere da noi condizionato;
000 1      0 0 0 1 (11)                      figura 20.·                                 lo possiamo infatti porre a 0 o a 1 a
                                                Vogliamo puntualizzare che: 1) Il Pro-   piacimento tramite una delle due istru-
  Partendo dalla cifra a destra si ha:       gram Counter è un registro da 16 bit;       zioni citate.

                                                                                                                                 35
```

## Pagina PDF 36

```text
                                                                                                      BUS DATI
        10011111                 +
        11010010
[]01110001
 t_carry

   Cioè 9F + D2 = 71 con il riporto di
1 (Carry di uscita = 1).
                                                           't0u                          I I I I I I I I I ACC
                                                                           I I I I I IIJ I I I I I _LI_lJ PC
                                                                                                                                          Accumulatore

                                                                                                                                          Program Counter


   Gli esempi fino ad ora fatti sono stati
                                                                                                   u __ [I I I I lcl ST                   Status

sviluppati nel sistema Esadecimale. Le
stesse cose però valgono anche nel no-
stro sistema Decimale che usiamo tutti
igiorni.                                                                                                               Bit di Carry
   Infatti se eseguiamo l'operazione:
8310 + 4110 = 1 2410
                                                                                                     BUS INDIRIZZI
sistema /'    t riporto
decimale
troviamo ancora il riporto, o carry, esat-     Fìg. 20-A/cuni particolari a/l'interno della CPU: Accumulatore, Program CountereStatus Register.
tamente come abbiamo appena visto.


                                                         GND                    40     RES
                                                                                                      Carry di uscita era uguale a zero, ma se
                                                         RDY                    39     <:>2           avessimo fatto: 9F + D2 avremmo
                                                          j1                    38     so             ottenuto:
                                                          l1IQ                  37     ;o
                                                                                36                    Tasti            Indirizzi        Dati
Esercizio con i'AMICO 2000A
                                                                                                                  ~
                                                          NMI                   35
                                                         SYNC                   34     R/W            IADI
                                                                                                                  ~ (primo dato, p.e. 02)
                                                          vcc                   33     DB,
                                                          A Bi                  32     DB1
                                                                                                      I DA I
   Cerchiamo ora di mettere in pratica
                                               ·Il        AB1       10          31     DB2
                                                          AB2                          083
                                                                                                      []          'lJlflfl (secondo dato, p.e. 03)
le varie nozioni che abbiamo appena                                 11          30

appreso.
                                                          AB3       12          29     084               Ora carichiamo il PC di partenza del
                                                          AB4       13          28     DB5
                                                                                                      programma. Diciamo cioè al calcolatore
   Il calcolo da fare è ancora il solito:
la Somma. però una volta la faremo con          I!
                                                I
                                                          ABS
                                                          AB&
                                                                    14
                                                                    15
                                                                                27
                                                                                28
                                                                                       DB6
                                                                                       DB7            da che punto deve partire l'esecuzione
                                                                                                      dello stesso.

                                                                                              !I-
                                                          AB7       18          25     AB15
il Carry di ingresso a 1, la volta succes-                AB8       17          24     AB14
siva con il Carry di ingresso a 0.
                                               -Il                                                       Allora premiamo I AD I 0201 poi
                                                          AB9       18          23     AB13
   Accendiamo la macchina e partiamo                     AB1'       19                 ÀB12

a scrivere il nostro programma per esem-                 AB11       20          21      GND           IRUN I sul display comparirà il risul-
pio dalla locazione di memoria [)2.fH.                                                                tato 0000 05.
   Il Carry all'uscita dell'operazione di-      ZOCCOLATURA      DEL MICROPROCESSORE 6502                Il risultato è 5 perchè il Carry di in-
pende dal risultato della operazione                                                                  gresso è stato posto a 0 (prima istru-
medesima.                                                                                             zione di CLC).
   Infatti nell'esercizio appena visto il           Fig. 21 - Piedini della CPU e loro funzioni.         Proviamo ora a porlo = 1. Per farlo
           (display)                                                                                  sostituiamo CLC (18) con SEC (38).
                                                                                                         Quindi sempre con la stessa procedura:
Tasti     Indirizzi    Dati   Istruzione     Commenti
                                                                                                      I AD I          0201         18
IAD I 0201            xx
                                                                                                      I "DA I         0201         38
IDA I 0201            18      CLC            Azzerramento del Carry
                                                                                                      IRUN!
rn        0202        A5 ì
                              LDA 06         Carico l'addendo
[I        0203        06 ~                                                                                                   INGRESSO

rn        02~         65 I
                              ADC07
                                             Sommo all'accumulatore il contenuto della
[JJ       0205                               locazione Vfl e il Carry.                                Ingresso
                                                                                                                                           ~-
                      Vfl '                                                                                                                          USCI TA
[f]
[[]
          0206
          02Vfl
                      85
                      m'
                           ! STA00           Metto il risultato nella locazione ~-
                                                                                                      del bus
                                                                                                      indirizzi                            u-
rn
[tJ
          02e'.8
          02VJ)
                      4C)
                      22 >    JMPMONITOR Istruzione di_ fine . programma. Tomo al
                                         programma dt Morutor.
[I]       020A        FE~
Ora che avete inserito il programma possiamo immettere i dati da elaborare.
                                                                                                      L'uscita viene a 0 solo quando tutti gli
                                                                                                      ingressi sono a I in quanto la funzione
                                                                                                      loi;?;ica impiegata è del tipo NANO.


                                                                                                              Fig. 22 - Decodifìca per /'indirizzo FF.

36
```

## Pagina PDF 37

```text
   Sul display apparirà come risultato 06.                                             TEMPORIZZAZIONE          DI   LETTURA
Il Carry in ingresso è stato posto da noi
a 1.
   Provat~ ora voi stessi a cambiare
dati e ripetere più volte l'esercizio.                                          ______,J!                                           \~-
   Per riassumere abbiamo:

02 +                                                                                       \                  I                     \~­
03 +
Carry                                              INDIRIZZI
                                                                           ©~~~~~~~~X                                               X~~~~~~
= 05          se il Carry di ingresso = ()


                                                                           ~-;;-----------------~----------
= 06          se il e arry di ingresso = 1
                                                    DATI
   Attenzione non spegnete a questo pun-
to l'elaboratore perchè fra poco aggiun-
geremo alcune istruzioni al programma.
                                                  A. Ne_lla zona tratteggiata è indifferente lo stato logico degli indirizzi. B. Nella zona tratteggiata
                                                  non s1 deve prendere per valido il dato eventualmente presente sul bus indirizzi.
Somma esedecimale e somma decimale

                                                  [I]          0201        18   CLC Ripristino l'istruzione di Clear Carry
  Per ciò che riguarda la somma dobbia-
mo ancora spiegare la differenza fra              IAD I 0006               xx   Apro la locazione 0006
somma esadecimale e somma decimale.               IDA I 0006               05   Introduco      l'addendo 05
  Abbiamo già visto nella parte prima
che è:                                            [[]          0007        05   Introduco      l'addendo 05
1010 = 0A 16.                                     IAD I 0200               F8   Mi riporto alla locazione 0200
  Ora è evidente che se si esegue la
operazione
                                                  IRUN I                        Faccio partire il programma
                                                     Il risultato sarà 10
05 +05                                               Ora cambiamo modo di funzionamento.
il risultato sarà 10 se espresso in forma         Tasti        Indirizzi Dati   Commenti
decimale e 0A se espresso in forma esa-
decimale.                                         I AD I 0200              F8   Mi riporto alla locazione 0200 il cui contenuto è da modificare.
   Ma attenzione! La matematica non è
una opinione.                                     OMJ 0200                 D8   D8 è il codice operativo della nuova istruzione che sostitui-
                                                                                sco alla precedente (F8).
0510 + 05 10 = 1010 il che equivale a             IRUN I                        Partenza programm::i
0A16
0516 + 0516 = 0A 16 il che equivale a               Il risultato sarà 0A.           .
1010                                                Provate ora a cambiare i dati e i modi di funzionamento. Qui di seguito riportiamo
   Il problema è solo quello di sapere in         qualche esercizio risolto.
che base si sta operando.
   Il nostro AMICO 2000 può lavorare              1310 + 1810 = 3110
in entrambe le basi. Per farlo ha due                                                                      Queste sono tutte istruzioni di un solo
istruzioni dedicate:                              1316 + 1816 = 2616
                                                     Notate bene che non si può scrivere                byte e che non richiedono altro per es-
    1) SED Set Decimai Mode. Codice                                                                     sere definite, sono cioè implicite.
operativo FB. Tutte le somme fatte dopo           0A 10• Il calcolatore comunque dà sem-
                                                  pre un risultato anche se non attendi-                   Le istruzioni LDA e ADC invece
 questa istruzione vengono eseguite in                                                                  n~cessitano di una ulteriore definizione.
 decimale.                                        bile. Esempio:
                                                                                                        Si deve infatti precisare cosa bisogna ca-
2) CLD Clear Decimai Mode. Codice                 1310 + 0A 10 = 2310- Risultano non attend.            ricare nell'accumulatore o cosa bisogna
operativo D8. Tutte le somme fatte dopo                   /"                                            sommargli.
questa istruzione vengono eseguite in                                                                      Nella tabella presentata nel capitolo
                                                  NON PERMESSO
 esadecimale.                                                                                         · secondo si trova:
   Aggiungiarno ora tornando al nostro
 computer queste ultime istruzioni al pro-                                                              A5     LDA         Zero page
 gramma precedentemente introdotto. Vi                                                                  65     ADC         Zero page
                                                   La "pagina zero"
 abbiamo detto di non spegnere la mac-
 china, se la avete spenta per qualsiasi                                                                   Cosa significa?
 ragione dovete reintrodurre il program-                                                                  La pagina zero (zero page) della me-
 ma precedente prima di procedere alle                Abbiamo fin qui esaminato abbastanza
                                                   approfonditamente le seguenti istruzioni:           moria è per definizione una zona della
 modifiche.              ,                                                                             memoria che comprende tutte le loca-
 Tasti       Indirizzi Dati   Commenti             Istruzione Codice operativo                         zioni comprese fra gli indirizzi 0000 e
                       xx     Apro la locazione    SEC         -+     38                               00FF ed è quindi formata da 256 byte.
                              0200                 CLC         -+     18                                  Vedremo quindi che è comodo lavo-
                       F8 Metto la macchina ·      SED         -+     F8                               rare con le locazioni di memoria in pa-
                          in calcolo dedmale       CLD         -+     D8                               gina zero. Perchè?

                                                                                                                                                      37
```

## Pagina PDF 38

```text
Mappa della memoria dell'AMICO 2000/A

indirizzo




                                                                                                         J.    PAGINA ZERO
                                                                                                         ";E 7ZONA UTILIZZATA
                                                                                                         J. DALLA GESTIONE
                                                                                                         " ; EF   CASSETTE

                                                                                                         ;;F;
                                                                                                               ZONA UTILIZZATA
                                                                                                               DAL  MONITOR
                                                   ESPANSIONE                                            ; ; FF
                                                   1KBYTE RAM



      - 7 FF   t--------------------1
                                                                                                              FC
                                                                                                                    VETTORI
                                                                                                                    DI RESTART



                                                  ZONA DI MEMORIA
                                                  NON OCCUPATA                               Fig. 23 - Mappa della memoria de/i'AMICO
                                                                                                               2000A.
                                                  (FUTURE ESPANSIONI)

                                                  GESTIONE CASSETTA

                                                  INPUT OUTPUT


                                                                                             A5_)AD
                                                  MONITOR                                    06 - 06 (parte bassa dell'indirizzo)

      f FFF
               ____________________.                                                                 00 (parte alta dell'in,dirizzo)
                                                                                                Però la seconda forma è più lunga.
                                                                                             Il programma che ne risulta occupa più
                                                                                             memoria, è quindi meno efficiente.
       Nota: la pagina 1 (da 01 ~~ a ~1 FF) è normalmente utilizzata per lo Stack.              A questo punto è necessario fare un
                                                                                             altro esercizio.
                                                 Abbiamo allora che 00 è sottointeso            Trasportiamo un dato dalla locazione
   Perchè si sa già che il primo byte                                                        06 alla locazione 00. Cominciamo il pro-
(la cosiddetta parte alta dell'indirizzo) è   ovvero c'è perchè sto lavorando con
                                              una istruzione (A5) che è in pagina zero.      gramma a partire dalla locazione 0200.
00. Allora analizzando meglio questa                                                         V edere tabella A.
zona di memoria:                                 Ma se voglio caricare il contenuto della       Facciamo partire il programma (cume
                                              locazione di memoria 0306 nell'accumu-         al solito si carica l'indirizzo di partenza
  0 0     0 0          0 0      F F
                      ~~-....-------          latore devo scrivere:
~e 2°byie             1° byte 2° byte                                                        0200 e poi si preme I RUN I) e vedremo
                                              AD
   Dove il 1° byte è la parte alta dello      06 (parte bassa dell'indirizzo)                il contenuto della locazione di memoria
indirizzo e il 2° byte è 1a parte bassa       03 (parte alta dell'indirizzo)                 06 copiato nella locazione 00.
dell'indirizzo.                                                                                 Per far ciò basterà comé al solito sele-
                                                 L'istruzione AD nella solita tabella
   Ciò che cambia è solo il secondo byte      cui abbiamo fatto cenno, viene indicata        zionale I AD l 0006, vedere il contenuto
ed è solo quello che dobbiamo precisare.      come "assoluto" (vedi: AD - LDA - Ab-
   L'istruzione che carica il contenuto                                                      sul display dei dati, poi selezionate \ AD I
                                              solute) cioè .i:ld essa deve seguire l'indi-
 della locazione di memoria 0006 nello        rizzo completo della locazione di memo-        0000 e verificate che in quella locazione
 accumulatore si scrive:                      ria da ·cui devo prelevare il contenuto.       si trovi lo stesso dato di prima.
A5                                               Ovviamente per la pagina zero esiste           Proviamo ora a modificare il program-
06                                            1'eguaglianza:                                 ma come segue.

 38
```

## Pagina PDF 39

```text
                                                                                                  d/Write, leggi/scrivi) piedino 34 dell'in-
                                        TABELLA A                                                 tegrato (Fig. 21 ).
Tasti    Indirizzi   Dati   Commenti
                                                                                                     Gli altri fili interessati sono: i pied1m
IAD I 0200           xx     Indirizzo di partenza                                                9+20 e 22+21 da cui la CPU fa uscire
IDA I 0200           ASI LDA Pagina 0. Contenuto della locazione 06 in Accumu-                   gli indirizzi della memoria interessata
                                                                                                 (AB0 = Address bit 0. cioè il bit meno
rn    0201           06 \ latore.                                                                significativo dell'indirizzo. ABI 1 = Ad-
rn       0202        85 ~   STA Pagina 0. Contenuto dell'accumulatore nella loca-                dress bit 15, cioè il bit piu significativo).
rn       0203        00 ~   zione 00.                                                                Per rinfrescare le idee sul concetto del-
                                                                                                  l'indirizzamento rimandiamo al 1° capi-
rn       0204        4C ~
                                                                                                  tolo.
rn       0205
                     22 ~
                            JMP MONITOR. Arresto del programma.                                      Spieghiamo ora cosa si intende per
                                                                                                  ~bit più o meno significativo".
rn       0206        FE                                                                              Se ci rifacciamo alla numerazione de-
                                                                                                 cimale. quella che usiamo tutti i giorni,
                                                                                                 prendiamo in considerazione un numero
                                                                                                 qualsiasi, ad esempio il numero 35.417.
                                                                                                     La variazione in più o in meno di una
Tasti    Indirizzi   Dati                                                                        unità assume evidentemente un valore
                                                                                                 (o peso) diverso a seconda della posi-
IAD I 0200           A5                             Il metodo di indirizzamento
                                                                                                 zione della cifra: in questo caso la cifra
IDA I 0200           AD                                                                          meno significativa è rappresentata dal
[I]   0201           06                                                                          7 (ovvero dalla cifra più a destra del
                                                   Abbiamo introdotto in sordina un              numero) quella più significativa dal 3
[I]   0202           00                         concetto nuovo: IL METODO DI IN-                 (ovvero da quella più a sinistra del
[I]   0203           85                         DIRIZZAMENTO. Ne abbiamo visto                   numero).
                                                due tipi: in pagina base e assoluto. Le              Trasferendo analogamente lo stesso
[I]   0204           00                         stesse istruzioni cambiano codice ope-           discorso al concetto dei 16 bit (dal bit
[I]      0205        4C                         rativo a seconda del metodo di indiriz-          0 al bit 15) degli indirizzi. vediamo che
                                                zamento usato. Dovrete esaminare con             il cambiamento di stato (da 0 a 1) del
[]       0206        22                         molta attenzione la tabella cui abbiamo          bit più significativo sposta l'indirizza-
rn       0207        FE                          fatto riferimento
                                                   Sarà molto importante e utile quando
                                                                                                 mento di memoria dal primo blocco
                                                                                                 che va dalla O alla 3276r locazione al
                                                si vorranno tradurre in linguaggio mac-          secondo blocco che va dalla 3?768a alla
   Se facciamo partire il programma (pre-       china dei programmi scritti in linguaggio        65535a locazione.
                                                simbolico.
mendo I AD I 0200 poi I RUN I) note-                                                                 Continuando la descrizione della CPU
                                                   Per ora fermiamoci qui con il software        i piedini 26 + 33 sono quelli tramite
remo che il risultato è lo stesso, ma il        (il linguaggio di programmazione), cer-          i quali essa presenta all'esterno un dato
programma è più lungo. Le stesse cose           cate di impadronirvi delle poche, ma             o lo preleva dall'esterno (DB0 = Data
dette per la istruzione LDA valgono             importanti nozioni e istruzioni che fino         Bit 0, cioè il bit meno significativo del
ovviamente per la istruzione STA. An-           ad ora vi abbiamo insegnato provandole           dato. DB7 = Data Bit 7. cioè il bit più
che per questa esiste un sistema di in-         direttamente sul microcomputer. Tenete           significativo del dato).
dirizzamento in pagina base (o pagina           conto che la macchina fa esattamente                 Se la CPU vuole prelevare un dato
zero) con codice operativo 85 e un si-          ciò che voi scrivete sulla carta interpre-       dalla locazione di memoria 0006 (lo fa
stema di indirizzamento assoluto con co-        tando le istruzioni a una enorme velocità        perchè noi glielo abbiamo indicato con
dice operativo 8D.                              e soprattutto senza sbagliare.                   un'istruzione) presenta il numero 0006
   Il precedente programma si può allora                                                         sui piedini di uscita dell'indirizzo. mette
riscrivere anche così:                                                                           a I il piedino R/W. e quando la fase
                                                                                                 cJ> 2 è alta (cioè a 1), legge sui fili dei
                                                                                                 dati quello che la memoria vi ha deposi-
Tasti    Indirizzi   Dati                                                                        sato (vedi figura 21). ·
I AD I   0200        A5                                                                              Vediamo ora di rispondere a questa
                                                Approfondimento hardware: il clock
                                                                                                 domanda: come fa la memoria a immet-
I DA I 0200          AD                                                                          tere i dati sui fili del bus dati?
rn     0201          06
                                                   Esaminiamo ora qualche aspetto fisico
                                                                                                     Per far ciò esiste una decodifica che
                                                                                                 esamina gli indirizzi che escono dalla
rn       0202        00                         dello scambio di segnali fra la C...PU (l'in-    CPU. Se questi indirizzi sono quelli
rn
[]
         0203        8D                         tegrato n. I a 40 piedini) e gli altri com-
                                                ponenti dell 'AMICO 2000/ A.
                                                                                                 voluti la CPU segnala alla memoria che
                                                                                                 la stanno interrogando e che puq immet-
         0204        00                            Il problema è: come può il 6502 (la           tere i suoi dati sul bus. In figura 22 è
rn[I]    0205
         0206
                     00
                     4C
                                                CPU) leggere nella ROM e leggere e scri-
                                                vere nella RAM?
                                                                                                 rappresentato il più semplice tipo di de-
                                                                                                  codifica che riconosce un indirizzo for-
                                                   Avete notato che nell'AMICO 2000/A             mato da tutti 1.
                                                c'è un quarzo da I MHz; questo signifièa             Se la CPU vuole scrivere un dato nella
llJ      0207        22
                                                che nel microcalcolatore c'è un oscillato-        cella di RAM ~ presenta all'uscita gli
[[]      0208        FE                         re che, oltre a tutto, è preciso e stabile. Il    stessi dati del caso precedente ma ora
                                                dock (l'onda quadra) di uscita di questo          tiene basso (ovvero a 0) il piedino R/W
                                                oscillatore scandisce tutti i tempi princi-       per indicare alla memoria che vuole scri-
   Facendo partire il programma anche           pali della macchina~ I segnali più impor-         vere. Ed essa lo fa. Il tutto come sempre
in questo caso vediamo che il risultato         tanti sono il 2 (OUT) cioè il piedino             viene scandito dal clock.
è sempre lo stesso.                             39 dell'integrato e il R/W (cioè Rea-                Questi sono i segnali che ora princi-

                                                                                                                                           39
```

## Pagina PDF 40

```text
                                               palmente interessano la nostra trattazio-           ricato da tastiera a partire dalla locazione
                  CLOCK
                                               ne; in seguito approfondiremo le funzio-            0300. Questo programma è stato scritto
                                               ni di altri piedini.                                così come lo trovereste nei testi inglesi
                                                                                                   e come li scriveremo noi successiva-
              ·caricamento
                                                                                                   mente. In pratica si tratta di ripetere le
               ora d'inizio                                                                        solite operazioni iniziali selezionando la
                                               Suddivisione della memoria
                                                                                                   prima locazione di memoria (tasto
                                               nell' AMICO :LOOOA                                  [ AD [), inserendo il primo dato o codice
                                                                                                   operativo dell'istruzione (tasto [ DA [)
                                                  In figura 23 viene riportata la mappa            procedendo poi ad inserire gli altri dati
                                               della memoria, cioè si mostra come è                utilizzando il solito tasto con la freccia
                                               posizionata la memoria di questo micro-
                                         Q)
                                                                                                   ([D.

                X= K-1
                                         -
                                         e:
                                          o
                                         ·5
                                         cn
                                               elaboratore.
                                                  È importante conoscere bene quali
                                               locazioni di memoria sono occupate per
                                               evitare di scriverci sopra o di interessar-
                                                                                                       Non analizziamo a fondo questo pro-
                                                                                                   gramma in quanto vi mancano ancora
                                                                                                   alcune nozioni, per ora ci limitiamo a
                                   ·- ....
                                   "C  ru      le in qualche modo quando si scrivono               sottolineare alcune particolarità:
                                         I/)
                                               dei programmi perché diversamente que-              - nella prima colonna è indicata la loca-
                                    c. .2                                                          zione di memoria in cui si va a porre
                                    o cn       sti ultimi non potrebbero funzionare.
                                    o Cl ru                                                        l'istruzione;
                                   ..J            Senza entrare per ora in altri partico-
                                               lari facciamo notare la Pagina Zero (in-            - nella seconda colonna c'è il byte (dato)
                                               dirizzi ffff)-;.- fflFF), il Monitor e la gestio-   da introdurre nella locazione di memoria
                                               ne della cassetta, che sono posizionati             indicata;
                                               nelle ultime locazioni di memoria.                  - nella terza colonna è riportata l'istru-
                                               A proposito, vi ricordate che cosa è il             zione in linguaggio mnemonico;
                                               Monitor? È quel programma, residente                - la quarta colonna è dedicata al com-
                                               in ROM, che dà vita alla tastiera e al di-          mento.
                                               splay, che permette cioè alla CPU di ac-               Analizzando ora qualche simbolo. Il
               LOC6=15                         cendere i LED, di acquisire il tasto pre-           simbolo = sta ad indicare che quello che
                                               muto e di interpretarne il significato.             segue è un numero, non una locazione di
                                               Esso permette inoltre l'esame del conte-            memoria; quindi se s{ scrive LDA = ffi si
                                               nuto della memoria, la modifica di que-             indica che carichiamo il numero ffi nel-
                                               sto contenuto (se la cella esaminata, è di          l'accumulatore, in maniera "immedia-
                                               memoria RAM) e la partenza dei pro-                 ta" come si dice in gergo, ovvero DI-
              LOC6 :LOC6+1                     grammi.                                             RETTAMENTE. Se però scriviamo
                                                                                                   LDA ffi invece carichiamo nell'accumu-
                                                                                                   latore il contenuto della lacazione di me-
                                                                                                   moria a:nJ.
                                                                                                      In linguaggio macchina le due istm
                                               Applicazione                                        zioni si traducono come segue:
                                                                                                   LDA# 00        A9
                                                                                                                  00
                                                  Questa volta faremo funzionare il cal-           LDA00          A5    .   .     . b
                                                                                                                  00   siamompagma ase!
                                               colatore da orologio. La calibrazione del-
                                               l'orologio dovrete farla voi perchè dipen-             Il simbolo Sprima del numero sta ad
               INCREMENTO                      de dalla precisione del vostro quarzo               indicare che il numero che segue è
                                               agendo essenzialmente su una locazione              espresso in Esadecimale.
               OROLOGIO
                                               di memoria.                                         quindi sarà:
                                                  Diamo una breve descrizione del fun-             LDA        #$10 = A9 IO
                                               zionamento di questo programma la cui               LDA        # 10 = A9 OA
                                               "costruzione" è stata fatta mediante una               Ripetiamo che per caricare il program-
                RINFRESCO                      cosiddetta "flow chart" o carta di flusso           ma si procede come al solito:
              , DISPLAY                        di cui parleremo più diffusamente più               ~ì          fMl      (parti~mo da questa
                                               avanti e che rioortiamo in figura 24.               ~ 03                 locazione)
                                                  Il programma è costituito essenzial-
                                               mente da un contatore. contenuto in
                                                                                                   Liii:]    0300 F8
                                               tre byte successivi di RAM, gli F9 - FA -           [I]       0301 A5
         SI                                    FB di pagina base. In F9 sono contenuti             e via di seguito fino alla fine.
                                               i secondi, in FA i minutL in FB le ore.               A questo punto dobbiamo caricare il
                                               Ogni secondo noi andremo a sommare                  numero dei secondi in un minuto, dei
                                               1 della locazione F9 (incremento dei                minuti in un'ora e delle ore in un giorno.
                                               secondi); poi ci chiediamo: siamo arri-
                                               vati a 60 secondi? Se abbiamo raggiunto             lAD I 0003 xx
                                               i 60 secondi, azzeriamo i secondi e som-
                                               miamo 1 ai minuti. Confrontiamo i mi-               [DA I 0003 60 secondi in un minuto
     Fig. 24 - Flow chart del programma per    nuti con 60 e ripetiamo l'operazione già
                                               fatta per le ore; poi si torna all'inizio.
                                                                                                   rn       0004 60 minuti in un'ora
          realizzare un orologio digitale.
                                                   Come al solito il programma viene ca-           rn       0005 24 ore in un giorno

40
```

## Pagina PDF 41

```text
  Ora carichiamo l'ora di partenza (qualche decina di secondi avanti rispetto a quella
esatta):
I RES \ 0000           xx       La pressione del tasto I RES I ci ha portato ad aprire la
                                locazione di memoria 0000.
I DA I 0000            (ss)     Inserisco i secondi
[f]    0001            (mm) Inserisco i minuti
[I]          0002      (hh) Inserisco le ore
 Si carica ora il PC di partenza del programma [AD \ 0300; si preme \ RUN I nel
momento in cui scocca l'ora da noi programmata.
  Volendo cambiare l'ora fermiamo l'orologio tramite il tasto I RES               I ripetendo
le operazioni succitate introducendo i nuovi valori. Se l'orologio non precede
giusto si può cambiare il contenuto della locazione 0312: diminuendo il valore
contenuto si accelera l'orologio, aumentando il valore si rallenta l'orologio.


      Programma di orologio

      Si carica dalla locazione 8 3 8 8

         l CiCA7.      CODICE                  ISTIWZIONE       COMMENTO
                       OPERAT.

         0300           F8                   SED                CONTO IN Dr CIMALE
         0301           A5                   LDA      $00       SECONDI DI SlART
         0302           DO                                      NEL. CONl Al ORE
         0303           B~·                  STA      $F9
         0304           F9
         0305           A~·                  L DA     $01       CARICO I MINUll
         0306           01
         0307           85                   STA      HA
         0308           FA
         [1309          A5                   LDA      $02       CARICO LE ORE
         030A           02
         0308           85                   STA      $FB
         030C           FB
         030D           A2                   LDX      11$95     AGGIUSTAGGIO FINE
         030E           95
         030F           GA                   DEX
         0310           DO                   BNE      030F
         031 ·1         FD
         0312           A9                    LDA     1$15      AGGIUSTAGGIO GROSSO
         0313           15
         0314           85                    STA     $06       CONTATORE IN L.OCAZ.
         03·15          06                                      DI MEMORIA 06
         0316           E6                    INC     $06       CONTATORE DI ATTESA
         0317           06                                      DI UN SECONDO
         0318           DO                    BNE     0334      RINFRESCO IL. DISPLAY
          0319           1A                                     SE NON ['PASSATO 1 SEC.
          031A          A2                    LDX     1$00      INIZIO SCANSIONE
          0318           00
          0:{1C          AD                   LDY     #$01      INCREMENTO
          0310           01
          031E           18                   CLC
          031F           98                   TYA               PRELEVO L'INCREMENTO
          0320           75                   ADC     F9,X
          0321           F9
          0322           DS                   CMP     03,X
          0323           03
          0324           DO                   BNE     032A
          032~·          04
          0326           A9                   LDA     1$00
          032·1          00
          032l'·         FO                   BEQ     032D
          0329           03
          032A           AD                   L.DY    1$00
          0328           00
          032C           EA                   NOP
          U32D           95                   STA     F9,X
          032E           F9
          0:~2~          E8                    INX
          0;13(1         ED                    CPX    U03
          0331           03
          033é1          DO                    BNE    031F
          [133::<        FB
          D3:~ti         20                    JSR    SCADS      ACCENSIONF: DISPLAY
          0:{35          oc
          0336           FF
          033"/          FA                    NOP               EQUALIZZAZIONE
          0338            A~·                  L.DA   $06        VEDO SE HO FINI"IO
          0339           06                                      L'INCREMENTO
          033A           DO                    BNE    0316
          o:~3B          DA
          033C           4C                    JMP    030D
          0331)          OD
          033E           03
```

## Pagina PDF 42

```text

```

## Pagina PDF 43

```text
                                                          CAPITOLO V




                  L'USO DEL REGISTRATORE A CASSETTE




                                               nastro magnetico un prògramma prece-            stessi (l'angolo interno smussato degli
                                               dentemente scrittò nella RAM e vicever-         zoccoli deve corrispondere al punto o
L'interfaccia per il registratore              sa. Quindi invece di avere ad esempio           alla tacca riportata accanto o sul lato
                                               una biblioteca di programmi scritti su          della, sèrigrafià di ogni integrato) perché
                                               carta (come nel nostro caso abbiamo             quello dovrà poi essere l'orientamento
                                               fatto fino ad ora) e doverli ogni volta         dell'integrato che ei va inserito. Comin-
    A cosa serve l'interfaccia per il regi-    reinserire a mano tramite la tastiera, li       ciamo con lo zoccolo di IC19 (8 piedini),
stratore e cosa è?                             potremo avere registrati su cassette, nu-       poi ICS, IC20, IC21 (14 piedini), indi
    Si tratta innanzitutto di una circuteria   merati e titolati e .sempre pronti all'uso.     IC7 (16 piedini) e IClO (24 piedini). Se
elettronica formata da logiche integrate,         Aggiungendo, come vedremo, solo              avete anche !'~spansione RAM rn<Ynt::ite
elementi discreti e un programma di            qualche componente alla scheda AMICO            gli zoccoli degli integrati IC 13,
gestione registrato su PROM che permet-        20001 A potremo collegarla ad un registra-      piedini).
te al nostro microelaboratore di comuni-       tore ed eseguire tutte le operazioni di             Una breve nota tecnica: ICS n...,
care i dati e di riceverli da un normale       cui abbiamo parlato. I componenti per           parte della circuiteria della interfacc~a
registratore a cassette. Abbiamo detto più     l'interfaccia registratore a cassette, così     cassete, ma viene fornito ugualmente
volte che i programmi che noi scriviamo        come le due RAM che servono per                 per poter completare la scheda (IC8 ser-
per far eseguire determinate funzioni          completare la scheda sono reperibili pres-      ve per l'espansione del BUS esterno).
all'elaboratore vengono generalmente           so lo stesso fornitore dell' AMICO 2000/ A.         Ora possiamo saldare tutti i condensa-
introdotti in memoria RAM: questo tipo                                                         tori da C6 a C13. Facciamo notare subito
di memoria come sappiamo si cancella                                                           che a seconda del tipo di registratore
ogni volta che spegniamo la macchina,                                                          usato si può eliminare C8 e fare un
mentre mantiene indefinitamente i dati                                                         cortocircuito al posto di C7. Inoltre può
finché rimane accesa. Ora, dato che sa-        Il montaggio                                    essere vantaggiòso montare un conden-
rebbe almeno "scomodo" tenere sempre                                                           satore da 0,22 µF in Milar fra i punti
accesa la macchina e soprattutto poco                                                          IN e GND riconoscibili nella piastra in
pratico, si presenta la necessità di dover                                                     mezzo in alto sotto la denominazione
conservare questi dati su qualche sup-             Per il montaggio dell'interfaccia casset-   "RECORD".
porto. Siccome i segnali che girano in         te procederemo come quando abbiamo                  Per ultimo salderemo i diodi LED
un elaboratore non sono altro che livelli      realizzato l'intera piastra AMICO 2000/ A.      D4 - 5 - 6 - 7 che come vedremo servono
alti e bassi di tensione (gli zeri e gli           L'elenco dei componenti è riportato         a sapere cosa sta accadendo quando è
uno) proprio come i fortissimo e i pia-        nella tabella 1O.                               in funzione il registratore. Attenzione:
nissimo di un brano musicale, ma senza             Per il montaggio e il corretto posizio-     montate i LED con la polarità corretta:
livelli intermedi, possiamo allora regi-       namento dei vari componenti ci riferiamo        in pratica basta far corrispondere il lato
strarli in maniera sequenziale su un na-       alla serigrafia del circuito stampato del-      smussato del LED con il - della seri-
stro magnetico alla stessa stregua di un       1' AMICO 2000/ A del capitolo 3°.               grafia.
brano musicale.                                    Dopo averne identificato il valore tra-         A questo punto, prima di inserire gli
    La funzione del circuito di interfaccia    mite la tabella 11 cominceremo per              integrati, controllate tutte le saldature, il
sarà allora quella di presentare al regi-      primo a saldare le resistenze da R34 a           corretto posizionamento di resistenze,
stratore i dati in modo sequenziale per         R43 prestando la solita attenzibne nel-         condensatori e l'orientamento degli zoc-
permetterne la registrazione e di consen-      l'uso del saldatore e dello stagno. Faccia-      coli dégli integrati. Potete ora inserite
tire all'elaboratore di interpretarli e di     mo notare che il valore di queste resi-          con la dovuta attenzione tutti gli. IC
 ritenerli in memoria nel posto giusto una     stenze R34 -7- R3 7 può essere indifferen-       dopo averli ben identificati per evitare
volta che gli vengono ripresentati. In         temente di 82 o I 00                             di scambiarli di posto. Ricordiamo ancora
 pratica, come vedremo più avanti nei             Possiamo ora saldare gli zoccoli pre-         una volta che gli integrati devono essere
 particolari, sarà possibile trasferire su     stando attenzione all'orientamento degli         orientati con la tacca in corrispondenza

                                                                                                                                         43
```

## Pagina PDF 44

```text
                                                                                                del puntino sulla serigrafia e (se non
                                                                                                avete commesso errori) dell'angolo smus-
                                                                                                sato interno allo zoccolo: in pratica tutti
                                                                                                con la tacca rivolta verso l'alto della
                                                                                                scheda disposta orizzontalmente.


                                                                                                L'utilizzo del registratore
                                                                                                ~ suo collegamento


                                                                                                    Nella PROM IClO risiede il program-
                                                                                                ma di gestione della cassetta magnetica
                                                                                                che consente le operazioni di registra-
                                                                                                zione e lettura. Come abbiamo preceden-
                                                                                                temente detto, questo programma vi per-
                                                                                                mette di utilizzare il vostro normale re-
                                                                                                gistratore a cassette per memorizzare i
                                                                                                programmi di maggior interesse, per
                                                                                                conservarli e caricarli quando vi servono
                                                                                                velocemente e senza errori.
                                                                                                    Dobbiamo avvertire che va prestata
                                                                                                 una particolare attenzione al tipo di
                                                                                                 registratore e alle cassette utilizzate.
                                                                                                Non che questi debbano essere ad alta
                           L'AMICO 2000/A collegato al registratore.
                                                                                                fedeltà, ma è importante che il registra-
                                                                                                tore sia a posto, con testine pulite e
                                                                                                trascinamento del nastro uniforme (cin-
                                                                                                ghia di trasmissione nuova e controllo
                                                                                                di velocità di trascinamento efficiente).
 , Tabella 10 - Elenco componenti circuito per interfaccia cassette ed espansione memoria RAM   Il nastro deve essere di qualità e la
                                                                                                meccanica della cassetta perfetta (non
                                                                                                utiliuatc cassette vecchie e impolverate).
 Resistori (tutti da 114 W, tolleranza 5%)                                                          Per le cassette consigliamo vivamente
                                                                                                di utilizzare quelle da 5 o 10 minuti
 R34-R35-                                                                                       per lato, oppure le C60, ma non regi-
 R36-R37              82 Q
                                                                                                stratevi sopra più di tre o quattro pro-
 R38                  22 kQ                                                                     grammi in quanto ogni volta dovete far
 R39                 1,8 kO                                                                     passare tutto il nastro per ric_hiamare
                                                                                                l'ultimo programma registrato. E impor-
 R40                 1,8 kO                                                                     tante che sappiate che sul nastro vengo-
 R41                 100   o                                                                    no registrati ben 300 bit al secondo circa
                                                                                                così che per un programma da 1 kbyte
 R42                  33 kQ                                                                     (8000 bit) che è molto lungo l'intera re-
 R43                 3,3 kO                                                                     gistrazione avviene circa 45 secondi com-
                                                                                                prendendo anche le code di inizio e fine
 Condensatori                                                                                    programma. Se poi pensate che l' AMICO
                                                                                                 2000/ A con l'espansione RAM ha circa
 C6-C7               6,8 nF - polistirolo                                                        1,5 kbyte di RAM nella quale possono
                                                                                                 essere scritti i programmi, vedete che
 es                    1 nF - polistirolo                                                        qualche minuto è più che sufficiente
 C11-Cl2             0,1 µF - ceramico a disco                                                   per registrare numerosi piccoli program-
                                                                                                 mi.
 Diodi                                                                                              La registrazione, se la sensibilità di
                                                                                                 registrazione non è automatica, va fatta
 D4-D5-D6-D7 :       diodi LED                                                                   con il potenziometro del volume di re-
                                                                                                 gistrazione a metà corsa; la lettura del
                                                                                                 nastro avviene invece con il potenzio-
 Integrati                                                                                       metro del volume a 2/3 circa. Su questi
                                                                                                 particolari comunque torniamo fra poco.
 IC7                 748287 (oppure 93427) - PROM di decodifica                                     L'uscita verso il registratore è contras-
 ICS                 74LS30 - NAND a 8 ingressi                                                  segnata nell' AMICO 2000A dalla parola
                                                                                                 RECORD ed è posizionata in alto e in
 IClO                93448 - PROM gestione interfaccia cassette
                                                                                                 mezzo alla scheda (vedere sulla serigrafia).
 IC13-IC14           TMS4045 (opp. 2114) RAM 1 K x 4 statica :·                                     Sotto la parola RECORD ci sono tre
 IC19               · LM358 - convertitore di ingresso per interfaccia cassette                  capicorda contrassegnati da:
 IC20                74LS132 - quadruplo NAND a due ingressi Schmitt Trigger                        GND, che va collegato alla massa del
 IC21                74LS38 - quadruplo NAND a due ingressi                                         registratore;
                                                                                                    IN, che va collegato all'ingresso del
                                                                                                    microfono del registratore;

44
```

## Pagina PDF 45

```text
                                                                                                                                       Spina   microfono
-     OUT, che va collegato con l'uscita
      dell'altoparlante del registratore.                                                                                                      GND
   Il vostro registratore dovrebbe avere                                                                                                                                          Spina       altoparlante
quindi una uscita per altoparlante sup-                                                                                                                                                 OUT
plementare che esclude quello incorpo-
rato. Se avete solo una piastra di regi-
strazione non amplificata è possibile che
non vada bene data la sua bassa tensione
di uscita.                                                                                                                                                                                        (vista lato
    Per quanto riguarda il collegamento                                                                                                                                                           saldatura)
pratico al registratore dobbiamo vedere
il tipo di prese che questo ha: in genere
quelli portatili monofonici a cassetta han-
no due prese standard, una a 7 poli
e una cosiddetta punto-linea. La prima ·
serve per l'ingresso del microfono, là
seconda per collegare un altoparlante
esterno.
    Il capicorda GND (massa) va allora                                                                                                         IN                                GND
                                                  Fig. 25 - Collegamento
collegato al piedino 2 della presa a 7 poli       pratico fra AMICO 2000A
tramite una adatta spina a 7 poli tipo            e prese di registrazione
Philips (Norme DIN) e al - della presa            e uscita altoparlante del
                                                                                                                                                                    OUT
 per l'altoparlante tramne adatta spina.          registratore a cassetta.                                                                Circuito stampato dell'AMICO 2000/A
     Il capicorda OUT con il piedino +
 della presa per altoparlante.
     Il capicorda IN con il piedino 1 della
 presa a 7 poli.                                  Operazione di lettura del nastro                                                                  Carichiamo il Program Counter che
     La fig. 25 mostra come vanno fatti in                                                                                                       vogliamo associare a REG (nel nostro
 pratica i collegamenti. Possibilmente, ma                                                                                                       caso quello di lettura della cassetta) nel-
                                                    Accendiamo allora il nostro AMICO                                                            le locazioni di memoria 00F6 e 00F7
 non è indispensabile dato l'alto livello         2000 A e impariamo subito a servirci del
 dei segnali, il collegamento al piedino                                                                                                         premiamo i tasti:                         '
 1 va fatto con cavetto schermato.                tasto I REGI                                                                                   IAD l00F6IDA154 [J]Fc IREG I
     Se avete prese di· tipo diverso sarà
 sufficiente identificare i piedini che ci                                                                                                       . ~. q~esto punto vedrete sul display
 interessano per fare i collegamenti come                                                                                                        mdmzz1 FC54. Infatti avete introdotto
 sopra descritto.                                                                                                                                la parte bassa dell'indirizzo (54) nella
     Possiamo ora collegare il registratore,                                                                                                     locazione 00F6 e la parte alta dell'indiriz-
 ma prima di farlo partire è necessario                04                       05                                06                07           zo (FC) nella locazione 00F7.
 sapere alcune cose.
     Noi possiamo accedere ai programmi
 che ci permettono di leggere e scrivere
                                                         r                                                                          r                     Con la semplice pressione di IREG I
                                                                                                                                                 possiamo ora richiamare l'indirizzo di
  sul registratore posizionando il PC come
  segue:
SCRITTURA Program Counter FBBC
LETTURA
                                                  CODA
                                                       r                    TESTO

                                                                                                      REGISTRAZIONE
                                                                                                                                  LETTURA
                                                                                                                                                 partenza della routine di lettura del
                                                                                                                                                 nastro.
                                                                                                                                                    Prendete ora la cassetta preregistrata
                                                                                                                                                 fo~ta con ~1 kit della interfaccia per
                                                                                                                                                 registratore mtroducetela in modo da
                                                                                                                                                 l~gg~rla su! lato 1, riavvolgetela, fate par-
                    Program Counter FC54
                                                  Fig. 26 - I quattro led D4, D5, D6, D7, servono a
                                                                                                                                                 tire il registratore in lettura (come se
  Ricordiamo c,he per posizionarci ad un                                                                                                         doveste ascoltare una musica) dopo aver
                                                  controllare le operazioni di lettura e scrittura
certo indirizzo basta usare il tasto              del nastro. Ciò che sta avvenendo è indicato                                                   posizionato a metà il potenziometro del
    IAD Iseguito dall'indirizzo stesso (in que-   dall'accensione del rispettivo Led secondo le                                                  volume e premete subito dopo il taste,
                                                  indicazioni riponate.                                                                          I RUN I sull' AMICO 2000/ A.

    sto caso FBBC e FC54).
       Tutto il programma utilizza le loca-
    zioni di memoria comprese fra la FB00
    e la FCFF, cioè 512 locazioni di memoria.
       A questo punto introduciamo l'uso               !abella !1 - !dentificazione delle resistenze contenute nel kit delle espansioni RAM e
                                                       mterfacc1~ registratore a cassetta.
    del tasto IREG Idel quale non abbiamo         ,,
                                                                                                         '               "
                                                                                                                                                    ...

                                                                        Valore                                                                            Codice colore
    ancora definito la funzione e che ora
    ci sarà molto utile.                                                                                                     t 0 colore        20 colore                  3° colore              4° colore
       Questo tasto ha la funzione di richia-
    mare un particolare indirizzo che noi                                   82 Q                                              grigio             rosso                         nero                 oro
    abbiamo precedentemente memorizzato
    nelle locazioni di memoria OOF6 e 00F7.                             100                 Q                                marrone             nero                         marrone               oro
    È chiaro che questo tasto può risultare                                 1,8 kQ                                           marrone             grigio                        rosso                oro
    molto utile quando si vuol far partire
    sempre un determinato programma. Ba-                                    3,3 kQ                                           arancio            arancio                        rosso                oro
    sta infatti premerlo per richiamare sul                                 22 kQ                                              rosso             rosso                        arancio               oro
    display indirizzi la locazione di memoria                               33 kQ                                                                                             arancio               oro
                                                                                                                             arancio            arancio .. ---
    in cui comincia il programma.                           ··--~.-.~.,_.   ~   ···•-.w .... -.O<<:O--•••--<   ·~,~~ ·
                                                                                                                                --                         ,,,._.,,,...
                                                                                                                                                                          '
                                                                                                                                                                               ,.




                                                                                                                                                                                                             45
```

## Pagina PDF 46

```text
                   BYTE                                 INDIRIZZO DI
     CODA                        IDENTIFICATORE                                  NO· DI BYTES           TESTO        CHECKSUM          CODA
                DI START                                CARICAMENTO


                                            Fig. 27 - Disposizione fisica dei dati registrati sul nastro.




    Dopo qualche secondo si devono ac-              Premiamo ora ! REG Ie apparirà sul                 nel modo corretto potete controllare che
cendere i LED relativi alla coda e ..alla                                                              a partire dalla locazione () 100 siano pre-
lettura del programma registrato, rispet-        display FC54 AY
                                                 che è l'inizio del programma di lettura.              senti 1 dati relativi al programma N. 1
 tivamente D4 e D7 dell' AMICO 2000/ A                                                                 descritto al paragrafo "Utilizzo della cas-
                                                 Si fa partire ora il registratore (tasto di
 (vedi fig. 26). Se ciò non avvenisse                                                                  setta registrata".
 aumentate il volume all'accensione              ascolto) quindi si preme subito RUN
                                                 per far eseguire il programma. A questo                  Vediamo ora di analizzare come sono
 dei LED.                                                                                              fisicamente registrati i dati sul nastro
                                                 punto il display indirizzi e dati del cal-
    Il lato 1 della cassetta contiene solo                                                             dando un'occhiata alla fig. 27.
                                                 colatore si spegne mentre dopo qual-
la registrazione di una lunga coda (tutti                                                                 Il primo tratto del programma è una co-
zeri) e serve proprio a tarare il volume         che secondo si accendono i LED 04 e
                                                 07, segno che l'elaboratore sta leggendo              da formata da tanti zeri che servono per
di uscita del registratore.                                                                            permettere al lettore di sincronizzarsi; se-
                                                 la coda del programma; dopo sei secondi
    Una volta regolato correttamente il                                                                gue un byte che identifica la partenza del
volume potete fermare il microelabora-           circa si accendono i LED 05 e D7,
                                                 segno che si è in fase di lettura del                 programma; segue poi un numero che di-
tore premendo [RES I e il registratore           programma registrato.                                 ce di quale programma si tratta; segue l'in-
                                                    Quando la lettura del testo è finita               dirizzo dal quale si dovrebbe caricare il
tramite il suo tasto di STOP.                                                                          programma (questo come abbiamo visto è
   Vediamo ora come si introducono i             sul display appare 0000 01
                                                 (01 è il numero del programma caricato).              modificabile con una istruzione specifi-
parametri che permt:ttono di caricare i                                                                ca); segue un numero che indica il numero
programmi nella memoria RAM del mi-                 Appena ciò avviene spegnete il regi-
                                                 stratore agendo sul suo STOP. Se al po-               di parole che formano il programma; se-
croelaboratore cioè di trasferirli dal nastro                                                          gue il testo del programma; segue una pa-
nel quale sono registrati.                       sto di 01 dovesse apparire FF la lettura
                                                 è avvenuta male. Bisogna allora ripetere              rola di controllo (checksum) ed infine una
   Girate allora la cassetta sul lato 2 e                                                              coda di chiusura.
riavvolgetela.                                   la lettura nella maniera precedente fino
                                                 ad ottenere la risposta voluta.                           Tutto questo, si noti bene, viene in
   I parametri da inserire nel microelabo-                                                             gran parte fatto automaticamente quan-
ratore sono sostanzialmente due (il NU-             Per verificare che tutto sia avvenuto
                                                                                                       do dobbiamo registrare un programma
MERO DEL PROGRAMMA e L'INDI-                                                                           dal microelaboratore sul nastro magneti-
RIZZO DAL QUALE SI VUOLE CHE                                                                           co ad opera dell'apposito programma di
QUESTO COMINCI AD ESSERE CA-                                                                           scrittura, ma su ciò torneremo fra poco.
RICATO) e vanno definiti come segue:                                                                       Un parametro molto utile è il numero
                                                                                                       di identificazione del programma, poiché
                                                                                                       se abbiamo più programmi registrati su
                                                                                                       uno stesso lato del nastro è possibile
INDIRIZZO      DATO        SPIEGAZIONE                                                                 caricare quello desiderato, a selezionarlo
                                                                                                       ci penserà il microcomputer.
0000           xx          Numero del programma da caricare, xx è un numero diverso                        Supponiamo per esempio di aver re-
                           da FF e da 00.                                                              gistrato sul nastro i programmi 1 - 2 - 3 -
                                                                                                       4 - 5 e di voler caricare quello N. 4.
0001           xx          Parte bassa dell'indirizzo dal quale si vuole che cominci il                    Per farlo riavvolgiamo il nastro com-
                           caricamento del programma nella RAM.                                        pletamente e scriviamo 04 nella locazione
                                                                                                       di memoria 0000 e FF (perché vogliamo
0002           xx          Parte alta dell'indirizzo dal quale si vuole che cominci il                 ricaricarlo a partire dall'indirizzo origi-
                           caricamento del programma nella RAM.                                        nale) nella locazione di memoria 0002.
               FF          Se inseriamo come parte alta dell'indirizzo FF il programma                     Facciamo partire il microelaboratore e
                           viene caricato automaticamente a partire dall'indirizzo già                 il registratore come abbiamo precedente-
                           registrato sul nastro.                                                      mente descritto e vedremo che dopo un
                                                                                                       certo tempo i'AMICO 2000/ A mostrerà
Notare che xx è un simbolo grafico che indica un numero qualsiasi.                                      sul display dei dati il numero04 segno che
                                                                                                       è stato caricato proprio quel programma, a
                                                                                                       questo punto fermeremo il registratore.
                                                                                                           Attenzione però che prima di proce-
   Allora, detto questo noi ad esempio vogliamo:
                                                                                                       dere alla lettura del nastro dovrete aver
1 - Caricare il programma N. 1.
                                                                                                       caricato precedentemente il Program
2 - Caricarlo in RAM a partire dall'indirizzo registrato sul nastro.
                                                                                                       Counter all'indirizzo di partenza del
   Premiamo quindi i tasti:
                                                                                                        programma di lettura (indirizzo FC54).
[RES 'DA 01 (numero del programma)              rn []] FF.                                                 Avvertiamo infine che se carichiamo
                                                                                                        un numero di programma non previsto
Il tasto[J]viene premuto due vone
perché non ci interessa dare la pane                                                                   sul nastro il microelaboratore continuerà
bassa dell'indirizzo in quanto ho deciso                                                               la sua inutile ricerca fino alla fine del
di far partire il programma dall'indirizzo                                                              nastro. In questo caso per ripristinare il
già registrato inserendo FF.                                                                            tutto basterà premere il tasto i RES !.

46
```

## Pagina PDF 47

```text
                                                                                                       In tal modo il programma verrà cari-
   Tabella 12 - Parametri richiesti dal programma di registrazione                                  cato a partire dalla locazione 0200. Pro-
                                                                                                    cediamo quindi all'operazione di lettura
                                                                                                    del nastro e verifichiamo alla fine che il
                                                                                                    testo registrato sia posizionato a partire
  Indirizzo                   Spiegazione                                                           dalla locazione 0200 fino alla 020F.

  8999
  9981
                    DAL
                    DAH
                          I   Indirizzo della locazione di ..memoria dalla quale si vuole imzjare
                              a registrare
                                                                                                    Montaggio dell'espansione RAM
  ffffff 2          AL.       Indirizzo dell'ultima locazione di memoria che si vuole .registrare
  9jJ93             AH
                                                                                                       È veramente elementare: si tratta, se
                                                                                                    non lo avete già fatto in precedenza,
l'' 9884            IDT       Identificatore (N. deJ'.programma)
                                                                                                    di montare gli zoccoli relativi agli inte-
                                                                                                    grati IC13 e IC14 e cioè le RAM stati-
                                                                                                    che da 4 kbit TMS4045 (o 2114) e inse-
                                                                                                    rire le stesse badando al corretto orienta-
                                                                                                    mento.
                                                       Dopo aver fatto c10 andiamo alla lo-            Il collaudo è altrettanto semplice: ba-
Operazione di registrazione                         cazione 0010 e scriviamo dei numeri pro-        sta portarsi all'indirizzo 0400, da questo
sul nastro                                          gressivi da 00 a 15 da questa locazione         fino a 07FF deve essere possibile scri-
                                                    alla 001F.                                      vere dei dati.
   Cambiate ora cassetta meµendone una                 Per il momento supponiamo che i nu-
delle vostre, riavvolgetela,.;e regolate il         meri che abbiamo scritto in queste lo-
livello di registrazione a metà se questo           cazioni costituiscano il programma che
'1on è automatico.                                  vogliamo trasferire sul nastro.
 Serviamoci ancne ora del tasto REG                    Per scrivere i numeri procediamo co-          Utilizzo della cassetta registrata:
caricando il PC di partenza della routine                                                            "'La tombola elettronica"
                                                    me ormai sappiamo: l AD I0010 l DA [00
di REGISTRAZIONE FBBC:
[AD [00F6 [DAI BC [[]FB                             [[]01 [[]02 [I]03 ... etc. fino a 15.
                                                                                                        Nel lato 2 della cassetta sono regi-
   Caricheremo ora i parametri richiesti               Se premiamo ora il tasto l REQ] appa-        strati due programmi: il primo è sem-
dal programma seguendo le indicazioni               rirà sul display                                plicemente una serie di numeri esadeci-
riportate in tabella 12.                            FBBC D8                                         mali dallo 0 al 32 registrati in locazione
   Le sigle accanto all'indirizzo hanno             che è l'inizio del programma di registra-       di memoria successive che vanno dalla
un valore simbolico, non sono ovviamen-             zione.                                          locaione 0100 alla 0132. ·
te dei dati: DA L, H significa che voglia-             Si fa partire ora il registratore in Regi-       Questo programma serve solo per con-
mo registrare da (L = parte bassa o                 strazione, si aspetta che sia passata la        trollare l'esattezza delle operazioni di
Low e H = parte alta o High dell'in-                coda non magnetica del nastro, quindi           caricamento in RAM.
dirizzo); A L, H significa che voguamo                                                                  Il programma numero 2 è invece la
registrare fino a quella determinata loca-           si pr~me [ RUN[ .                              versione "anni 2000" del vecchissimo
zione di memoria.                                      Si accenderanno immediatamente i             gioco della tombola. In pratica il nostro
   Facciamo un esempio: si vuole regi-              LED D6 e D4, poi per breve tempo                elaboratore farà le funzioni del sacchetto
strare il contenuto delle locazioni di me-          i LED D6 e D5, quindi ancora D6 e               dal quale si estraggono i 90 numeri.
moria (ovvero il programma) che vanno               D4 e infine il display del microelabora-            Dopo aver riavvolto il nastro selezio-
dalla:                                              tore mostrerà 0000 indicando con que-           niamo, come già sappiamo fare, il pro-
0010 (cioè DAH = 00 è DAL = 10)                     sto che il programma è stato registrato.        gramma N. 02 e lo carichiamo a partire
alla 001F (cioè AH = 00 e AL = lF)                  A questo punto si deve fermare anche             dalla locazione già registrata sul nastro.
e vogliamo chiamare il programma con                il registratore premendo il suo tasto di            La prima istruzione del programma è
il numero 13.                                       STOP.                                           stata caricata nella locazione 0200, men-
   Procederemo allora come segue:                      Per verificare di averlo caricato corret-     tre l'istruzione di inizio è posizionata
[AD[                                                tamente possiamo per prima cosa modi-           nella locazione 0230.
                                                    ficare il contenuto della locazione dalla           Per far partire il programma facciamo
0000                                                0010 alla 001F ponendole ad esempio             allora:
[DA[                                                tutte a FF. Ora possiamo caricare il             [Aìi]0230 [ RUN I
                                                    programma registrato ripetendo l'intera
 10          (DAL)                                  procedura descritta in precedenza al pa-        apparirà sul display la parola VIA.
 []                                                 ragrafo "operazione di lettura".                   A questo punto per estrarre i numeri
                                                       Ricontrolliamo il contenuto delle loca-      (che arrivano in modo del tutto casuale)
00           (DAH)                                  zioni che abbiamo appena modificato:            basta premere il tasto F; il numero e-
 []                                                 il contenuto dovrà essere quello del            stratto compare sul display dati. Premen-
                                                    programma che abbiamo appena cari-              do successivamente F per 90 volte estrar-
 lF          (AL)                                   cato.                                           remo tutti i numeri.
 []                                                    Se vogliamo caricare il programma               Il nostro programma però non si limita
                                                    registrato a partire da una locazione di        a far questo, infatti permette di eseguire
00           (AH)                                   memoria diversa da quella registrata, ad        in qualsiasi momento i seguenti controlli:
 []                                                 esempio la0200. procediamo come segue:          Numero delle estrazioni effettuate (tasto
 13          (IDT)                                  IAD [0000 [DAJ 13 [1J00 Lf]02.                  [fil).   .

                                                                                                                                             47
```

## Pagina PDF 48

```text
                                                                                                            do controllare se un certo numero, ad
                                                                                                            esempio il 24, è. stato già estratto ba-
                                                                                                            sterà battere sulla tastiera il numero ri-

                ANO                      =o--                     (Logica ANO)
                                                                                                            chiesto (nell'esempio il 24) quindi pre-
                                                                                                            mere D.
                                                                                                               Se il numero è stato già estratto com-
                                                                                                            pare: 24 i (i sta per Si).
                                                                                                               Se il numero non è stato estratto com-
                                                                                                            pare: 24 o (o sta per No).

                ORA                     ==D---                    (Logica OR)
                                                                                                               Se si preme il tasto D senza avere
                                                                                                            introdotto prima il numero, sul display
                                                                                                            comparirà 00.
                                                                                                               Esame della sequ~nza dei numeri estrat-
                                                                                                            ti (tasti [fil e [CJ).
                                                                                                                È possibile in ogni fu.omento esamina-
              EOR                       ~D- (Logica ExcluxiveOR)                                            re tutti i numeri nella stessa successione
                                                                                                            nella quale sono usciti. Per far ciò si
                                                                                                            preme prima il tasto B facendo compa-
                                                                                                            rire sulla prima cifra a sinistra del di-
                                    Fig. 28 - Funzioni Logiche AND. OR, EOR.
                                                                                                             splay indirizzi la lettera P che significa
                                                                                                            primo numero estratto. A questo punto
   Premendo in qualsiasi momento il ta-                  momento sono stati estratti 9 numeri.              premendo il tasto e compare sulle pri-
sto E comparirà sul display indirizzi il                   Veri.fica della avvenuta estrazione di           me due cifre a sinistra del display indi-
numero delle estrazioni effettuate segui-                                                                    rizzi il primo numero estratto. PremendlJ
                                                         un numero (tasto [Q] )                              ~uccessivamente il tasto e comparirà il
to da un trattino e da una E. Ad esempio
09 - E _che significa che fino a quel                      Sempre in qualsiasi momento, volen-               2°, 3°, 4°, ecc. numero estratto fino al-
                                                                                                             l'esaurimento.
                                                                                                                Premendo ulteriormente il tasto C
 TABELLA 13 -                                                                                                comparirà sul display: U - - -
 Tavola della !erità per le funzioni lo~cbe AND, OR, e exclusiye O.I!.                                          Questo significa che abbiamo visto
                                                                                                            tutti i numeri estratti.
                                                                                                                Questa operazione di controllo può
                                           USCITA                                                           essere ripetuta quante volte si vuole.


         ,,,,
          A                    B
                               ,,              •
                                                                                                                Fine del gioco
                                                                                                                Dopo aver estratto il 90° numero, se
                                                                                                            premiamo ancora il tasto F comparirà
                               1               ,,    H


                                                               :~USCITA                                     sul display la parola FINE. Per ricomin-

                               "
          1
                                                                                                            ciare basterà premere ~ .
          1.-                  1              ·"                                                               Un'ultima nota: alla estrazione degli
                                                                                                            ultimi dieci numeri, la ricerca da parte
                                                                                                            del calcolatore di quelli rimasti potrà
                          .'                                                                                essere più laboriosa. Può capitare di do-
  A                 B\.                     ljSCITA                                                         ver premere più di una volta il tasto F
                                                                                                            per estrarre il numero.

  Il
                                               •                                                            SOFTWARE
  lii               .1

                                                                                                               Esaminiamo in questo capitolo alcune
                                                                                                            istrutioni molto interessanti e di estrema
                                                                                                            utilità: AND ORA. EOR
                                                                                                               Sono istruz10ni logiche che ricalcano·
                                                                                                            esattamente le funzioni svolte dai circuiti
                                                                                                            mtegrat1 che già conoscete (Vedi fig. 28).
  A                 B                       USCITA                                                             Per completezza riassumiamo le no-
                                                                                                            zioni fondamentali di queste funzioni
                                               flJ             A~~·~
                                                               B~~
                                                                                     .. -.·.·. . ÙùiSCITA
                                                                                                            logiche.
                                                                                                               Se si hanno 2 segnali di ingresso, A
                                                                                                            e B che entrano in una porta AND,
                                                                    I   EOR
                                                                                                            l'uscita della porta risponde· alla logica
                                                                                                            riportata nella tabella 13: cioè se i due
                                                                                                            segnali di ingresso sono a 1, l'uscita va
                                                                                                            a 1. Se un qualsiasi segnale di ingresso
                                                                                                            va a 0, l'uscita va a 0.
                                                                                                               Per le altre due funzioni si veda an-
                                                                                                            cora la tabella 13_

48
```

## Pagina PDF 49

```text
   Facciamo notare sull'ultima funzione,                                                           I
                                                                                                                                        ANO
che se i due ingressi sono uguali, l'usci-
ta va a 0, se sono diversi l'uscita va a I.
                                               A5                                           ral
                                                                                                   I
   Il microprocessore è in grado di rea-
lizzare queste funzioni operando bit per
                                               f6                                           ta I
                                                                                                   I
bit.                                                                                               I
   Vediamo cosa significa.
   Si abbia una parola in ACCUMULA-
                                               A4                     I    fa
TORE (per esempio AS) e si voglia
fare l' ANO con F6: la CPU esegue l'ope-
razione come rappresentato in Fig. 29.
   Bit per bit vuol dire che si esegue                     Fig. 29 - Come il microelaboratore esegue /'operazione logica AN D.
l'operazione di ANO sui bit di ciascuna
colonna senza che ci sia influenza fra
una colonna e le altre.
   Proviamo ad eseguire praticamente
l'operazione appena descritta con il mi-                                                                       Prestiamo ora attenzione a quanto
croelaboratore. Scriviamo il programma                                                                      segue: eseguendo l'operazione di ANO
quanto segue:                                                                                               fra un numero qualsiasi e 00 si ottiene
                                                                                                            come risultato 00. Mentre facendo ANO
                                                                                                            fra un numero qualsiasi ed FF si ottiene
                                                                                                            come risultato lo stesso numero di par-
Indirizzo Codice        Codice           Commenti                                                           tenza (Esempio 3A ANO 00 = 00;
                                                                                                            3A ANO FF = 3A).
           Macchina Mnemonico                                                                                  Passiamo ora ad analizzare l'istruzione
                                                                                                            ORA.
0200       A9            LDA #$A5         Carico AS in accumulatore                                            Lasciamo invariato il programma ap-
   1       AS                                                                                               pena scritto cambiando la seconda istru-
   2       29            AND#$F6          Eseguo ANO con il dato immediato F6                               zione.
   3       F6                                                                                               0200 A9 LDA #$AS
   4       85            STA00            Porto il risultato presente nell'accumulatore                         1 AS
   5       00                             in 0000                                                               2 09 ORA#$F6
                                                                                                                3 F6
    6      4C            JMPMONITOR Istruzioni di arresto. li controllo delle operazio-                         4 8S STA $00
    7      22                       ni ritorna al programma di Monitor e rende                                 5 00
    8      FE                       operativa la tastiera e i1 displav                                         6 4C      JMP MONITOR
                                                                                                               7 22
                                                                                                               8 FE

  Introduciamo come al solito il pro-
gramma a partire dalla locazjone 0200:
IAD i0200 l12._1() A9   WAS [I] e così via
fino a introdurre FE. Facciamo partire il
                                                                                                                                        OR
programma usando il tasto -1 REG Ie cioè:                                                      I

iAo l00F6 ioA 100 [IJ02 i REG I
                                               AS                 1       lii        ta   11:                 fd
  Sul display compare:
                                               f6                                         IJ i                     !I§
                                                                                             I
0200 A9                                                                                        I
                                                                                               I
   Premiamo i RUN I comparirà sul di-
splay:                                         f7                                         ,,,  I
                                                                                               i
                                                                                               I
0000 A4
che è il nostro risultato.                                   Fig. 30 - Come il microelaboratore esegue /'operazione logica OR.
   Fate un po' di esercizi cambiando i
dati di partenza alle locazioni 0201 e
0203. Per esempio eseguiamo S3 ANO
07. Il risultato è 03. Premiamo allora i
tasti:                                                                                         I                                        EOR
                                                                                               I
IAD 10201 ioA ls3 [f] W01 I REG I
IRuNI
                                               A5

                                               f6
                                                                          fa         t6   9J I
                                                                                          jJ
                                                                                               I
                                                                                               I
                                                                                               I
                                                                                                              ra
                                                                                                                   flJ
                                                                                                                           =j
e si ottiene il risultato cercato.                                                             I
   Provate ora a verificare con l' AMICO                                                       I
2000/ A le seguenti uguaglianze:
14 ANO SE = 14
SA ANO AS = 00
                                               53                jJ             ,,        fd II
                                                                                               I

                                                                                                       ,,
2F ANO 89 = 09
06 ANO 77 =56                                              Fig. 31 - Come il microelaboratore esegue /'operazione loKica EOR.


                                                                                                                                                   49
```

## Pagina PDF 50

```text
         t       Logico (I' FF dell'esempio)                                                             La stessa equazione può essere rap-
                                                                                                      presentata con i simboli logici come in

               ==J~
               A
                                                                                                      fig; 32.
                                                                                                         Notiamo che se il segnale di ingresso
                                                                                                      (A) è~ l'uscita (A) è 1, se A = 1
                                                                                                      allora A= 0.
                                                                                                         Ultima particolarità: l'EOR di una pa-
                                 Fig. 32 - Operazione di EOR con 1 (FF).                              rola con se stessa dà per risultato 0
                                                                                                      (vedi fig. 33). Verificatelo. . . .     .
                                                                                                         Solitamente vengono usati dei s1mboh
                                                                                                      standard per indicare le tre operazioni
   La CPU esegue l'operazione come rap-                 più inconsueta, ma è comunque molto           appena analizzate. Essi sono:
 presentato in fig. 30. Verifichiamo anche              utile. Il solito programma di prova si        /\per AND
questo risultato facendo girare il pro-                 modifica agendo sulla seconda istruzione      V per OR
gramma.                                                 e cioè inserendo all'indirizzo 0202 il dato   V per EOR
   Vediamo anche in questo caso alcune                  49 (che è .il codice macchina dell'istru-
importanti "curiosità". L'OR di un nume-                zione EOR). La CPU esegue l'operazione            Detti A e B i due numeri si scrive
ro qualsiasi con 00 lascia invariato il                 come rappresentato in fig. 31.                allora:
numero. L'OR di un numero qualsiasi                        Verificate questa operazione facendo       A /\ B; A V B; A V B.
con FF dà come risultato FF.                            girare il programma. Anche sull'EQR               Le istruzioni svolte sono state tradot-
   Esempio:                                             dobbiamo fare delle osservazioni parti-       te in linguaggio macchina nel programma
55 OR 00 = 55                                           colarmente importanti.                        solo per il sistema di indirizzamento
7B OR FF = FF                                                                                         immediato. In questo sistema di indiriz-
                                                           Notiamo subito che eseguire l'EOR          zamento il dato che dobbiamo utilizzare
   L'ultima operazione, EOR, è forse la                 di un numero con 00 lascia invariato il       è contenuto nel secondo byte dell'istru-
                                                        numero stesso.                                zione.
                                                           Eseguire invece l'EOR di un numero
                                                        con FF, lo nega. Cosa vuol dire? Se               Se si deve caricare il numero 12 nel-
                                                        facciamo A5 EOR FF risulta:                   l'accumulatore, cioè se dobbiamo cari-
                                                                                                      care l'accumulatore con il dato imme-
                                                        A5      1010 01'?1                            diato 12, scriveremo in linguaggio mne-
                                                        FF      1111 1111                             monico LDA # $12, che si traduce il
                                                               0101 1010                              codice macchina A9 12. Eseguita l'istru-
                                                                                                      zione troviamo caricato in accumulatore
                                                           Notate che dove c'era lo zero nella        proprio il numero 12.
 Fig 33 - Operazione di EOR di un numero                parola di partenza, c'è 1 nel risultato e         Abbiamo già spiegato questo concetto.
               con se stesso                            viceversa. Abbiamo cioè negato la parola.      I codici operativi relativi alle istruzioni
                                                                                                       AND, OR, EOR nei tre modi di indiriz-
                                                                                                       zamento fino ad ora descritti sono
                                                                                                       riportati in tabella 14.
                                                                                                          Un'ultima cosa. Le operazioni logiche
  TabeÌla 14 - Codici operativi delle istruzioni AND, ORA e EOR.                                      descritte influenzano 2 altri bit dello
                                           '•
                                                                                                      Status register: il bit di ZERO e il bit
                                                                                          .
                                                                                                      di NEGATIVO .
     Istruzione                                          lndirizzamentQ
                                                                                                          Il registro di Status deve essere ag-
                                                                                                       giornato allora come mostrato in fig. ~4.
                                                                                                          Se il risultato dell'ultima operazione
                             immediato          #       pagina zero       #        assoluto      #    eseguita è = 00, il bit Z viene messo
                                                                                                      automaticamente a 1.
       AND                       29             2            25            2         2D          3        Se il risultato dell'ultima operazione
                                                                                                      eseguita è negativo (ovvero quando il
         ORA                     9"9            2           95             2         9D          3    bit più significativo del risultato è = 1)
         EOR                     49             2           45             2         4D          3    il bit N viene messo automaticamente a 1.
               .•..
                                                                                                          Spiegheremo il concetto di numero
                                                                                                       negativo nella matematica binaria nel .
                                                                                                       prossimo capitolo.
Nota: #è il numero di byte che formano l'istruzione. - - - - - - - - - - - - - - -
                                                                                                          I bit dello Status sono molto impor-
                                                                                                      tanti (ne vedremo ancora tre) perché
                                                                                                      servono a fare i salti condizionati che
                                                                                                       verranno analizzati anch'essi nel capi-
     N                                                                         STATUS
                                                    CARRY

                                                                                                      Esercitazione
                                       L-----        ZERO               1s RISULTATO      ZERO

                                                                                                         Vi proponiamo un semplice esercizio
      L-------------~NEGATIVO                                           1:NEGATIVO                    logico.
                                                                                                         Implementiamo con un programma
                      Fig. 34 - Bit della Status register fino ad ora esaminati.
                                                                                                      la funzione NAND (quella svolta dalla
                                                                                                      logica SN 7400 per intendersi).

50
```

## Pagina PDF 51

```text
                                              ANO            INVERTER


         =O-=
                             Fig. 35 - Equazione logica di NAND costruita con le/unzioni AND e di inversione.




   Notiamo che vale la equazione logica
riportata in fig. 35. Per realizzare quindi          Codice oggetto ovvero lista delle istruzioni che compongono il programma delia .. Tombola
la funzione NAND bisogna prima fare                  elettronica".
un ANO, poi un EOR con FF.                           Nella prima colonna formata da quattro cifre compaiono gli indmzzi, su ogni riga
                                                     16 dati contenuti in 16 locazioni di memoria successive.
   Problema:
  Eseguire il NAND fra il contenuto
della locazione di memoria 0001 e quella
della locazione 0002. Mettere il risultato          Oé~OO  ==A2 00 F8 18 E8 69 99 C9 00 DO F8 BA 60 AA A9 00
nella locazione 0000.                               0210 =F8 18 69 01 CA DO FA 60 EA EA EA EA EA ACJ OD AA
                                                    0220 =95 00 E8 EO 9C,' DO F9 60 EA EA EA EA EA EA E~' EA
   Soluzione:                                       0230 =20 10 02 A9 3E 85 8F A9 30 85 90 ACJ 77 85 91 A9
0200 AS          LD A S01                           0240 =O 1 85 08 EA EA EA EA E6 OF 20 7E FF AS OF F8 ·18
Indirizzamento in pagina zero                       0250 ::69 08 C9 91 90 10 29 OF C9 02 DO 04 A9 0·1 DO 06
    1     0                                         0260 =C9 01 DO 02 A9 02 85 OF 20 00 02 AA B5 10 FO 06
    2    25      ANO S02                            0270 =:4C A6 03 EA EA EA A5 OF 85 OE 20 20 FF DO 04 85
Indirizzamento in pagina zero                       0280 =OD FO C6 A5 OD DO C'"Ic. E6 OD A9 9'l 8D 03 FD PO ~... 7
    3    02                                         0290 =:FF C9 ·15 DO 4B E6.0C A5 oc C9 ~B FO 26 A5 OE 20
    4    49      EOR =SFF                           Oé'.AO =:EU 03 AS DA 85 93 A5 OB 85 94 20 DO 03 EA EA EA
Indirizzamento immediato                            02BO =EA EA EA EA 85 09 A5 DE 20 00 02 AA A5 oc 95 10
    5 FF                                            02CO =:4C 49 02 C6 oc A9 71 85 8F A9 30 85 90 A9 3·7 85
    6    85      STA S00                            0200 =91 A9 79 85 92 A9 00 85 93 85 94 85 09 4C 49 DE
Indirizzamento in pagina zero                       02EO =C9 14 DO 1B A5 oc 20 OD oc. 20 EO 03 A~• DA 8~1 8F
    7    00                                         02FO =:A5 OB 85 90 A9 40 8~, 91 A9 79 8~, 92 4C 75 03 C9
    8 4C         JMP MONITOR                        0300 =11 DO OE A9 01 85 08 20 DO 03 A9 73 8~· 8F ,. e 75
    9    22                                         0310 =03 C9 12 DO 36 A5 08 A2 00 E8 ED 5B FO 16 o~, "1()
   A FE                                             0320 ::DO F7 20 DO 03 BA 20 OD 02 20 ED 03 é'.O 42 03 E:6
   Utilizzate questo programma carican-             0330 =08 4C 7s=_, 03 A9 3E 85 8F A9 40 85 90 8~· 9·1 85 92
                                                    0340 ::DO EF A5 DA 85 8F A5 OB 85 90 60 C9 ·13 DO 31 A5
do dei dati in 0001 e 0002.
   Verificate che i risultati tornino:              8350 =09 DO 05 'tC 88 03 EA EA 2o 00 02 AA 85 "10 FO OD
27      NANO         AE         09                  0360 =:A9 10 85 92 A9 00 85 91 B~· 09 4C lt9 o···
                                                                                                    c.. ACJ se DO
lE      NANO         ~          E7                  0370 =F1 EA EA EA EA A9 00 85 09 'tC 49 oc.. . EA EA EA EA
9B      NANO         66     = FO                    0380 =CCJ' 19 DO 03 4C 30 02 C9 10 BO DF 8~· OA A5 09 OA
                                                    0390 =DA DA OA o~ OA 85 09 20 EO 03 20 DO 03 PO 42 03
                                                    03AO =4C 49 02 EA EA EA 20 EB FE DO 02 B~· OD AS oc C9
   Esercizio. Eseguire il NOR fra il con-           0300 =5A DO 03 4C 76 02 4C 49 02 EA EA EA EA EA EA EA
tenuto della locazione di memoria 0007              03CO =EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA
e il contenuto della locazione di memoria           0300 =A9 00 85 8F 85 90 85 91 8~, 92 60 EA E~ EA EA EA
0009. Il risultato va posto nella 0000.             03EO =A8 29 OF AA BD EA FF 85 08 98 4A 4A 4A 4A AA BD
Provate ricordandovi che il NOR è un                03FO =EA FF 85 OA 60 99 09 69 A2 19 69 98 00 FE: 6F F5
OR negato.




                                                                                                                                                 51
```

## Pagina PDF 52

```text

```

## Pagina PDF 53

```text
                                                            CAPITOLO VI




                                                 I NUMERI NEGATIVI




      utte le operazioni fatte fino a questo
T     momento hanno preso in considera-
      zione solo numeri positivi; le nostre
operazioni infatti hanno utilizzazo cifre
                                                    Il problema immediatamente succes-
                                                 sivo da risolvere è il cambiamento di
                                                 segno di un numero positivo e viceversa.
                                                    Per esempio il nostro numero 1 sap-
                                                                                              e non inferiori a -128. Questo avviene
                                                                                              solo se lavoriamo con numeri contenuti
                                                                                              in una sola locazione di memoria (8 bit);
                                                                                              naturalmente nella matematica che ci
dalla 00 alla FF (numeri di 8 bit) senza         piamo che in esadecimale si scrive 01;       costruiremo i numeri potranno essere
che ci fosse ombra di segno. Una doman-          il nostro -1 allora come si scrive in esa-   contenuti in più locazioni di memoria:
da che viene spontanea è: come si pos-           decimale con numeri da 8 bit?                per esempio tre successive.
sono rappresentare i numeri con il segno?           La regola generale dice che bisogna          Riprendiamo Qfa il discorso del nume-
   Il sistema che esamineremo per ri-            prendere il numero positivo, negarlo bit     ro positivo e negativo e proviamo ad
spondere a questa domanda si chiama              per bit, quindi sommare 1. Cioè in pra-      eseguire la somma:
COMPLEMENTO A DUE ed è univer-                   tica riferendoci alla fig. 37 abbiamo che
salmente usato.                                                                               12 + (-1).
                                                 secondo questa regola:
   I numeri che prendiamo in considera-                                                         Eseguiamola prima sulla carta:
zione sono sempre di otto bit, ma nel-           +1 = 01
l'ambito di questi otto bit introdurremo         -1 = FF
                                                                                                   0001 0010 +           (12)
anche il segno. Come si fa?                                                                        1111 1111             (FF)
   È rnolto semplice, basta prendere atto
di questa convenzione:                              Attenzione, per evitare di farvi con-     w 0001 0001                (11)
i numeri che hanno il 1° bit (quello più         fondere le idee vi rammentiamo che se         L_carry
significativo) uguale a 1 sono NEGA TI-          consideriamo il numero FF in valore as-
VI; i numeri che hanno il 1° bit uguale          soluto (come abbiamo fatto fino ad ora),        Come risultato della operazione otte-
a 0 sono POSITIVI.                               esso è il numero più grande da 8 bit         niamo 11. Il Carry esce dalla operazione
   Per chiarire le idee si osservi la fig. 36.   e vale 25510; nella convenzione di com-      a 1, ma in questo caso non se ne tiene
   Bisogna prestare attenzione a questo          plemento a due però, nella quale il primo    conto.
particolare: in un numero formato da             bit è quello di segno, FF è il numero          In questo modo abbiamo sottratto 1 al
otto bit, sette di questi rappresentano il       negativo -1.                                 numero 12.
numero vero e proprio in valore assoluto,           Sembrerebbe ora che col nostro mi-          Eseguiamo ora la stessa operazione
mentre l'ottavo - il più significativo -         crocomputer si possano sommare e/o           sull' AMICO 2000A con questo semplice
rappresenta il segno.                            sottrarre numeri non superiori a + 127       programma:
   Abbiamo allora che con 7 bit possiamo
rappresentare 27 = 128 numeri diversi;
considerando ora sia quelli positivi che
quelli negativi essi raddoppiano e diven-
tano 256, ritroviamo cioè il valore i~ = 256     0200    18     CLC                 Clear del Carry
che già conosciamo per i numeri da 8 bit.           1    D8     CL..J)              Funzionamento esadecimale
   Secondo la convenzione suddetta di-              2    A9     LDA %$12            Carico 12 in accumulatore in maniera immediata
ciamo dunque che i numeri FF (1111                  3    12
1111), 82 (1000 0010), A0 (1010 0000), e            4    69     ADC%$FF             Sommo FF in maniera immediata
95 (1001 0101) sono numeri negativi (il             5    FF
primo bit è a 1) mentre i numeri 00                 6    85     STA00               Porto il risultato nella locazione di memoria 00
(0000 0000), 14 (0001 0100), 7E (0111               7    00
1110) e 39 (0011 1001) sono numeri                  8    4C     JMPMONITOR          Torno al monitor. Stop.
positivi (il primo bit è a 0).                      9    22
   Facciamo notare che in questa con-               A    FE
venzione il numero 0 è considerato come
numero positivo.

                                                                                                                                    53
```

## Pagina PDF 54

```text
BIT PIU SIGNIFICATIVO                                                                                     Questo perchè i numeri positivi vanno,
                                                                                                       in decimale, da 010 a +12710, quelli nega-
                      +
BIT DI SEGNO          7      6      5      413           2      1     rl      (I NUMERI DALLO - AL 7   tivi da -l 10 a -12810, in tutto 256 numeri
                                                                                                       (compreso lo zero).

            111--1'_1_l----t-i----1__._I_I_I
                                                                               INDICANO LA POSIZIONE


:..~
                                                                               DEI BIT)                    Le particolarità da tener presenti sono
                                                                                                       dunque:
                                                                                                       con 8 bit si possono rappresentare
                  NUMERO
                                                                                                       128 numeri positivi 0 + 127
                  POSITIVO                                                                             128 numeri negativi -1 + -128.
                                                                                                          Il numero negativo comspondente a
          Fig. 36 - Segno di un numero di 8 bit (di cui selle costituiscono il valore assoluto         0 è ancora 0.
                           del numero e uno, il più significativo, il segno.                              Il programma appena illustrato è ovvia-
                                                                                                       mente in grado di trasformare un numero
                                                                                                       negativo nel suo corrispondente positivo.
                                                                                                       Verificate i seguenti risultati:
  Eseguendo il programma verrà imme-                  riuscire poichè avete tutte le cognizioni
diatamente visualizzato il risultato.                 richieste.                                       (n)       (p)
  Modifichiamo il programma per ren-                     Ad ogni modo il programma è quello
                                                                                                       B9        47
dere più agevole il cambiamento dei dati:             riportato a fondo pagina.                        C4        3C
                                                                                                       98        68
                                                                                                       8F        71
0200        18      CLC
      1     D8      CLD
      2     A5      LDA 00                 Carico il dato della locazione 00 in accumulatore
      3     00
      4     65      ADC 01                 Sommo il contenuto della locazione 01                       Sottrazione tramite        numeri negativi
      5     01
      6     85      STA 00                 Riporto il risultato nella locazione 00
      7     00                                                                                            A questo · punto è evidente che la
      8     4C      JMPMONITOR                                                                         differenza fra due numeri si può sempre
      9     22                                                                                         riportare alla somma fra due numeri.
      A     FE                                                                                            Infatti 13 - 7A = 13 + (-7A) = 13 +
                                                                                                       + 86 = 99 = -67.
                                                                                                          Tenete sempre presente che si tratta
   I dati vanno introdotti nelle locazioni 00            In sostanza questo programma ese-             di numeri esadecimali.
e 01. Scriviamo allora il programma. cari-            gue la procedura di calcolo prima indi-             Verificate queste operazioni con i pro-
chiamo il Program Counter per utiliz-                 cata: negazione del numero e somma con           grammi appena scritti.
zare il tasto REG (alle locazioni 00F6 e              1 trascurando il Carry.                             Può essere utile spesso poter disporre
00F7) in modo che richiami l'indirizzo                   Per usare il programma procediamo             di un mezzo che ci permetta, senza fare
0200 poi premiamo i tasti nella sequenza              come al solito introducendo nella loca-          fatica, di trasformare un numero negativo
                                                      zione di memoria 00 il numero del quale
llig[J [QAJ 12 [I] FF                                 si vuole ·calcolare il negativo per otte-
                                                                                                       o positivo del sistema decimale in quello
                                                                                                       corrispondente nel sistema complemen-
                                                      nere nella stessa locazione 00 il risultato
I REG 11 RUN I.                                       cercato.
                                                                                                       to a due.
                                                                                                          Per far questo abbiamo scritto un pro-
                                                         Vi diamo alcuni numeri con il loro            gramma di cui troverete a fine capitolo
   Il risultato (11) compare immediata-               corrispondente negativo:                         la lista delle istruzioni (codice oggetto).
mente nel display dati.                                                                                   Il programma parte dalla locazione
                                                      (p) (n)
   Per cambiare i dati di partenza basta                                                               0200 e arriva alla 02D3. Vi consigliamo
                                                      00 00         (il negativo di 0 è ancora 0)
introdurli alle locazioni 00 e 01, quindi                                                              di registrarlo su cassetta in modo da
far partire il programma.                             01 FF
                                                      0E F2                                            poterlo utilizzare ogni volta che ne avete
   A questo punto vi insegnamo un pic-                                                                 bisogno. Attenzione. però, questo pro-
                                                      47 B9
colo programma che permette di calco-                                                                  gramma non è rilocabile, cioè deve esse-
                                                      7F 81
lare il numero negativo una volta dato il                                                              re sempre scritto a partire dalla locazione
numero positivo. Attenzione! Se volete                   Notate che nell'ambito dei numeri da          di memoria 0200.
non guardate ciò che segue e provate a                 8 bit non esiste un numero positivo che
farlo voi; con un po' di pazienza dovreste             abbia come numero negativo 8111.                   Per utilizzarlo, una volta scritto, è mol-
                                                                                                       to semplice: premete i tastilAD 10230
0300        18      CLC                                                                                IRuNI.
   1        D8      CLD                                                                                      Premete il tasto [ç]e sul display indi-
      2     A5      LDA00                  Prelevo il dato da trasformare dalla locazione 00
      3     00                                                                                         rizzi compariranno tre zeri. Scrivete ora
      4     49      EOR '\li-$FF           Nego il numero contenuto in accumulatore                    il numero che intendete trasformare, pre-
      5     FF                                                                                         mete il tasto [E] se volete farlo diventare
      6     69      ADC\\1                 Sommo 1
      7     01                                                                                         negativo (e viceversa): contemporanea-
      8     85      STA00                  Riporto il dato nella locazione 00                          mente sul display dati compare il risul-
      9     00                                                                                         tato. Da notare che questo programma
      A     4C      JMP MONITOR. Stop.                                                                 è stato scritto per evitare che commet-
      B      22                                                                                        tiate errori: tutti i numeri fuori della
      C      FE                                                                                        portata -128++ 127 non vengono accet-

 54
```

## Pagina PDF 55

```text
                       SCHEMATIZZAZIONE DELLA CPU 6502                                                     i 7 bit andando ad influenzare l'ottavo
                                                                                                           bit, cioè quello di segno.
                                                                                                              Chiariamo subito le idee con qualche
                                                                                                           esempio:
                                    7
                                                    A
                                                                     •.I   Accumulatore A
                                                                                                                1111 0111 + (F7 = -09)
                                                                                                                1111 1110 = (FE = -02)


                                                                     'I
                                    7
                                                    y
                                                                                                           [i] 1111 0101        (F5 = -0B)
                                                                           Registro indice Y               Carry
                                                                                                             Nel risultato il bit di segno (il primo
                                    7

                                    I               X                'I    "8gistro indice X
                                                                                                           a sinistra) è 1 e il numero è quindi ne-
                                                                                                           gativo, infatti esso non eccede il limite
                                                                                                           dei 7 bit.
15
                 PCH
                                   • 7
                                                PCL                  'I    Program Counter "PC"
                                                                                                             Vediamo ora la somma di due numeri
                                                                                                           negativi più grandi:
                                                                                                                1001 0110 + (96 = -6A)
                                e
                                                                     'I
                                     7
                                                                                                                1000 1111 = (8F = -71)
                               I I
                                1                   s                      Puntatore di STACK "S"
                                                                                                           [i] 0010 0101 (25 = +25)
                                     7                                                                     Carry
                                        N   V   B       o                  Registro di STATO"P"               li risultato è un numero che ha cam-
                                                                                                           biato segno. Il bit di segno infatti è 0,
                                                                           Carry 1 = Vero                  si è ottenuto cioè un numero positivo
                                                                           Zero 1 .. il risultato = I      sommando due numeri negativi!
                                                                           lnterrupt 1 • Disabilitato
                                                                                                              Operando in matematica con comple-
                                                                                                           mento a due bisogna tener conto di questi
                                                                           Sistema decimale 1 • Inserito
                                                                                                           cambiamenti di segno per evitare errori.
                                                                           Comando di BREAK                Si può dimostrare che, sviluppando una
                                                                           Overflow , • Viro               funzione di questo genere:
                                                                           Negativo 1• Negativo            V= A1. 81. R1 + lù . 81. R1 in cui:
                                                                                                           A1 è il bit più significativo del primo
                                                                                                           addendo; B1 è il bit più significativo del
                                                                                                           secondo addendo; R1 è il bit più signifi-
tati. Oltre a questo programma riportiamo                                                                  tivo del risultato. La barretta sopra il se-
nella tabella 1 una tavola di conversioni                                                                  gno del bit sta per negato; Il· è il simbolo
da numeri negativi (sopra) e positivi (sot-             L'Overflow                                         della operazione di AND; Il + è il simbolo
to) in sistema decimale a numeri negativi                                                                  della operazione di OR.
e positivi in sistema complemento a due                                                                    - se V = 0 non ci sono stati errori nella
(e viceversa).                                             Analizziamo ora un'altro bit dello sta-         operazione.
                                                        tus, quello di oveiflow. Il concetto di            - se V = 1 c'è stato un cambiamento di
   Usare queste tavole è molto semplice,                overflow nasce dall'introduzione dei nu-           segno nell'operazione.
facciamo un esempio.                                    meri con segno appena fatta. Infatti ab-              Verifichiamo V per i due esempi ap-
   Vogliamo sapere a cosa corrisponde                   biamo sempre detto che la somma di due             pena fatti.
il numero -77 (in decimale) nel sistema                 numeri può generare un riporto (Carry)             1° esempio: A1 = 1. B1 = 1. R1 = 1
complemento a due.                                      se il risultato eccede la dimensione degli                        V=1·1·0+0·0·1=0
   Cerchiamo 77 all'interno della tavola                otto bit che abbiamo a disposizione.                  Il risultato è dunque esatto.
in alto (numeri negativi), sulla riga del                  Nel caso di numeri col segno però               2° esempio: A1=1, B1=1, R1=0
77 a sinistra troviamo il numero B sulla                abbiamo solo 7 bit per il numero, dato                            V=l · l · l +~·0·0=1
colonna "1 a cifra"; sulla colonna del 77               che il bit più significativo è stato utiliz-          C'è un cambiamento di segno nel risul-
troviamo in alto il numero 3 sulla riga                 zato per il segno. Può succedere che               tato. V si chiama "bit di overflow" e viene
"2" cifra": la traduzione sarà quindi B3.               sommando due numeri negativi si ot-                calcolato automaticamente dalla CPU ad
Procedete all'inverso per trasformare un                tenga un numero positivo o sommando                ogni operazione che lo condiziona.
numero da complemento a due a deci-                     due numeri positivi si ottenga un numero               Iri generale, in forma molto semplice
male_                                                   negativo; questo perchè il risultato eccede        possiamo dire che la CPU pone .V = 1
                                                                                                           se il risultato dell'operazione eseguita
                                                                                                           esce dai limiti permessi per un numero
                                                                                                           con segno da 8 bit (7 di valore assoluto
                                                                                                           e 1 di segno) cioè se è al di fuori del
     0   0    0 0          0+ 1 Il numero precedente viene nega-
                               0        0   1                                                              campo -128---:-- +127.
     1   1    1 1          1(+ f) to bit per bit, cioè dove c'era uno
                               1        1   0
                                  "zero", si scrive un "uno" e dove
                                  c'era un "uno", si scrive uno
              +                   "zero".                                                                  L'istruzione SHC
                                  Si somma 1 al risultato della
     0 0 0 0    0 0 0 1     +l    negazione.
     --1-1~~1-~1~1-·r---1--       Risultato FF                                                                Questa istruzione esegue la differenza
                                                                                                           (sempre operando nella convenzione dei
                                                                                                           numeri negativi ovvero del complemen-
             Fig 37 - Trasformazione del numero ()J positivo in negativo (-1) nel sistema                  to a due) fra il contenuto dell'accumula-
                               complemento a due: il risultato è FF                                        tore, il contenuto di una locazione di

                                                                                                                                                    55
```

## Pagina PDF 56

```text
memoria e il negato del bit di Carry.           visto alcuni di questi bit, comunque di
L'om~razione in forma simbolica si scrive:      seguito li riesaminiamo tutti insieme.
              A-M-C-A                               C = Carry
   Cioè la differenza fra l'accumulatore,       - Bit di Carry. È il riporto in varie ope-          È una categoria di istruzioni (riportate
il dato in memoria, il negato del Carry,        razioni, per esempio in quella di som-           a fondo pagina) molto importante, che
va a finire nell'accumulatore. Questa i-        ma.                                              permette di eseguire o non eseguire un
struzione può operare sia in sistema deci-         Z =Zero                                       salto da un punto all'altro del programma
male che esadecimale, a seconda se la           - Questo bit dello stato viene messo a           in base al risultato di una operazione
CPU sta lavorando in maniera decimale           1 se il risultato dell'ultima operazione         precedente.
o meno. C (negato del bit di Carry) si chia-    eseguita è uno zero. Molte istruzioni               Vediamo ora quale è il significato di
ma in inglese borrow ed è il riporto dell'o-    modificano questo bit. Per esempio quel-        alcune di queste istruzioni indipendente-
perazione. La presenza del C è un artificio     la di Somma, Load, quelle logiche di            mente dai bit di status, ovvero come se
del microprocessore per poter calcolare         AND, OR, EOR.                                   non dovessimo tener conto del valore
in codice binario complemento a due.               I = Richiesta di interrupt                   di essi.
    Tenete presente una regola molto im-        - Se questo bit è a zero risulta abilitato         Ci spieghiamo meglio.
portante: quando eseguite delle somme           l'interrupt in ingresso alla CPU. In un            Spesso le istruzioni di Branch vengono
dovete sempre mettere, prima dell'esecu-        capitolo dedicato esamineremo questo            utilizzate subito dopo le istruzioni di
zione della operazione di somma, il c = 0.      aspetto dell'hardware.                          comparazione ("compare" in inglese) co-
    Quando fate delle sottrazioni tramite           D = Modo di funzionamento decimale          me CMP, CPX (che vedremo fra poco),
l'istruzione SBC dovete sempre mettere,          - Se questo bit è a uno la CPU sta             CPY; di decremento come DEC, DEX
prima dell'esecuzione della differenza, il      operando in matematica decimale. Que-           (che vedremo fra poco), DEY o di in-
c=L                                             sto bit può essere posizionato a zero o         cremento come INC, INX (che vedremo
   Ci sono ancora delle particolarità mol-      a uno tramite due apposite istruzioni           fra poco) e INY.
to importanti da tener presenti: l'istru-       (CLD - SED).                                       Tutte queste istruzioni eseguono una
zione SBC mette a 1 il bit di Carry se              B = Comando di BRK                          certa operazione: nella comparazione, ad
il risultato dell'operazione è maggiore          - Questo comando sarà esaminato in             esempio, la CPU esegue una sottrazione
di 0; mette a 0 il bit di Carry se il           seguito.                                        fra i due dati da comparare dando un
risultato dell'operazione è minore di 0.            V ~ Bit di overflow                         certo risultato che influenza i bit di Sta-
   Il bit di overflow viene messo a 1 se         - È il bit esaminato nelle operazioni          tus interessati (si veda la tabella riassun-
il risultato dell'operazione non è com-          differenza. Molte operazioni lo condizio-      tiva delle istruzioni del 6502). In pratica
preso fra + 127 e -128, altrimenti viene         nano.                                          quando i due dati che vengono compa-
messo a 0.                                                                                      rati sono uguali il risultato di questa
                                                    N = Bit di negativo
   Eseguiamo ora l'operazione di calcolo                                                        sottrazione è 0, ma noi non lo vediamo.
                                                 - Viene messo a uno se il risultato
di numero negativo già descritta in pre-                                                        Questo risultato però mette a 1 il bit Z
                                                 dell'ultima operazione eseguita è negati-
cedenza utilizzando questa volta l'istru-        vo. In pratica è il bit più significativo      dello Status.
zione SBC. (Posizionatevi su una locazio-                                                          Premesso ciò vediamo il significato
                                                 del risultato dell'ultima operazione ese-
ne di memoria a piacere per cominciare           guita. Viene condizionato da molte ope-        per esteso delle seguenti istruzioni:
a scrivere il programma).                        razioni sia aritmetiche che logiche.            BEQ Salta se il risultato
                                                                                                         (della operazione precedente)
D8 CLD                                              I bit di status I e B sono legati es-                è=0
38 SEC (notate che mettiamo il Carry            senzialmente alla circuiteria esterna al         BMI Salta se il risultato
                                        a 1)    microelaboratore e non li esamineremo                    (della operazione precedente)
A9 LDA -\\- 00 Carico il numero 0 nel-          finché non avremo a che fare con questi                  è < 0 (negativo)
 l'accumulatore 00                              dispositivi.                                     BNE Salta se il risultato
E5 SBC $00 Sottraggo il dato da com-                In questo momento i bit di status che                (della operazione precedente)
 plementare 00                                  maggiormente ci interessano sono quat-                   è =I 0
85 STA $00 Metto il risultato in loca-          tro, e cioè: C - Z - V - N.                      BPL Salta se il risultato
00                                 zione 00         Questi bit in generale vengono condi-                (della operazione precedente)
4C JMP MONITOR, Stop                            zionati automaticamente dalla istruzione                 è ~ 0 (positivo)
22                                               che stiamo eseguendo e ci permettono,              Ricordiamo che 0 nel sistema di nu-
FE                                               eseguita la istruzione, di prendere delle       merazione complemento a due è un nu-
Abbiam0 fatto un programma che calcola           decisioni in base al risultato della opera-     mero positivo.
     00 - NUMERO= - NUMERO                       zione eseguita.                                    Visto questo, se a una comparazione
    Il numero (dato di ingresso) viene pre-         Sono proprio queste decisioni che ren-       facciamo seguire la istruzione BEQ ot-
levato all'inizio dell'operazione dalla lo-      dono l'elaboratore "intelligente".              teniamo che verrà eseguito un salto quan- .
·cazionc di memoria 00 e alla fine viene            Le istruzioni che prendono una deci-         do i due dati messi a confronto saranno
ancora depositato nella locazione 00 con         sione in base ai risultati delle operazioni,    uguali (la differenza fa 0, quindi va a
il segno cambiato.                               sono le istruzioni di BRANCH (salto             1 il bit di Status Z, quindi BEQ esegue
    Verificate con questo semplice pro-          condizionato).                                 il salto).
gramma le operazioni di calcolo prece-
dentemente eseguite verificandone la                                                            Queste istruzioni sono: - - - - - - -
corrispodenza.
                                                 BCC il salto viene eseguito se il bit cii Carry       è = 0: codice op. 90
                                                 BCS il salto viene eseguito se il bit di Carry        è = 1: codice op. B0
                                                 BEQ il salto v1ene eseguito se il bit di Zero         è = 1: codice op. F0
Status (P)                                       BMI il salto viene eseguito se il bit di Negativo     è = 1: codice op. 30
                                                 BNE il salto viene eseguito se il bit di Zero         è = 0: codice op. D0
                                                 BPL il salto viene eseguito se il bit di Negativo     è = 0: codice op. 10
    I bit che fanno parte del registro           BVC il salto viene eseguito se il bit di Overflow     è = 0: codice op. 50
 di status sono riportati tutti nella tabella    BVS il salto viene eseguito se il bit di Overflow     è = 1: codice op. 70
 delle istruzioni del 6502; abbiamo già

 56
```

## Pagina PDF 57

```text
   Per riassumere diremo allora che se
qualsiasi operazione eseguita immediata-
mente prima di BEQ 'dà come risultato
0 (potrà essere una somma, una diffe-
renza, una operazione logica tipo ANO,
OR, ecc.), verrà eseguito il salto.                                    ( 0001) __.,. ACC
   Lo stesso ragionamento vale per le
altre istruzioni: BMI ad esempio esegui-
rà un salto se il risultato di una opera-
zione immediatamente precedente è ne-
gativo (cioè se il bit più significativo
del risultato è = 1, cioè quando il bit                                                      SI
di Status N = 1).
   Una ultima nota sulla istruzione BVC:
questa può essere usata per corregere
un errore in un operazione di sottrazione.
   Facciamo notare che tutte le istruzioni
di salto (Branch) sono formate sempre
da due byte di cui il primo è il codice                                  FF ___. ACC
operativo (es. 90), il secondo rappresenta
l'entità del salto, ovvero il numero di byte
che si devono saltare nell'esecuzione del
programma. Quest'ultimo numero è
espresso in complemento a due, cioè il
salto rispetto alla posizione in cui il Pro-
gram Counter è in quel momento, può
essere negativo (numero di byte indie-
tro) o positivo (numero di byte in avanti).
A ben comprendere e saper utilizzare
le diverse istruzioni di Branch si impa-
rerà man mano che verranno presentati
esempi di programma. L'importante per
ora è che impariate a memoria le condi-
zioni che provocano il salto per ogni
                                                     Fig. 38 - Diagramma di flusso (o flow-chart) del programma per il riconoscimento
istruzione di Branch.                                                          di numeri negativi e positivi.
   Vediamo subito di utilizzare alcune di
queste istruzioni per costruire un pro-
gramma che analizza un numero n.
   Se n ~ 0 il microelaboratore dovrà              Commentiamo di seguito per esteso          comunque Z = 1. È chiaro allora che
scrivere 00 nella locazione di memoria         il programma che è stato appena scritto.       l'istruzione BEQ in questa posizione e-
0000;                                              r istruzione: LDA @1 - Si carica il        quivale ad un salto incondizionato, cioè
se n < 0 si scrive FF nella locazione          contenuto della locazione di memoria           il salto viene sempre e comunque esegui-
di memoria 0000.                               0001 (pagina zero) nell'accumulatore.          to. (LDA :\\:00 infatti genera sempre Z =
   Questo programma può essere scritto         Automaticamente la CPU influenza i bit         = 1, BEQ va a controllare che, se è
sotto forma di svolgimento logico o dia-       di stato Z e N, per cui nella istruzione       uguale a uno, salta: quindi esegue sem-
gramma di flusso come rappresentato in         successiva possiamo andarne a controlla-       pre il salto in questo caso).
Fig. 38.                                       re uno (in particolare N) per decidere             Analizziamo ora l'entità di questi salti.
   Vediamo in questa figura due simboli        se eseguire il salto condizionato.                 Nel microprocessore 6502 il Branch
nuovi, il rettangolo e il rombo, usati         2a istruzione: BPL A VA 1 - Abbiamo "eti-      è sempre relativo alla posizione del Pro-
rispettivamente per indicare una opera-        chettato" questa istruzione con un nome        gram Counter. Ciò significa che quando
zione da eseguire e una domanda che ci         di fantasia (A VAl). Questa procedura è        si esegue il Branch, il numero che segue
si pone.                                       molto comoda nella stesura dei program-        il codice operativo del Branch viene som-
Scriviamo ora il programma proposto.           mi perché serve ad indicare dove dob-          mato al valore del Program Counter in
Il numero di cui vogliamo analizzare il        biamo eseguire il salto. Con l'istruzione      quel momento, quindi l'esecuzione del
segno sia contenuto nella locazione di         BPL la CPU va a vedere se il bit di            programma continua dal nuovo Program
memoria 0001.                                  negativo (N) è = 0. Notiamo che è              Counter generato.
0320                 A5 LDA 01                 l'istruzione che precede (la prima) che ha         Nel nostro esempio la CPU preleva
    1                01                        condizionato il bit N. Se N = 0 (con-          dalla memoria alle locazioni 0322 - 0323
    2                10 BPL AVAl               tenuto dell'accumulatore ~ 0) il salto         puntate dal Program Counter l'istruzione
    3                07                        viene eseguito, diversamente si prosegue       10, 07 (BPL AVAl) posizionandosi su-
    4                A9 LDA %$FF               nella esecuzione del programma con la          bito dopo alla locazione successiva 0324
    5                FF                        istruzione immediatamente successiva.           e preparandosi, se non succede niente,
    6 INDI           85   STA 00               3° - 4° - 5° - 6° istruzione - Nessun com-     ad eseguire la istruzione contenuta in
   7              00                           mento salvo che alla 4 a è stato attribuito     questa locazione. Prima della esecuzione
   8              4C    JMP Monitor            il nome IND I.                                  della BPL ci troviamo quindi nella se-
   9              22                           7° istruzione: BEQ INDI - Notiamo subito       guente condizione:
   A              FE                           che la 6a istruzione ha caricato in manie-      PC= 0324.
   B AVAl         A9    LDA %00                ra immediata zero nell'accumulatore.               Se il salto deve essere eseguito bisogna
   c              00                           Quindi il risultato della 6a istruzione è       posizionarsi sulla locazione 032B, ovvero
   D              F0    BEQ INDI               sempre e comunque uno zero; allora             il PC deve essere incremento di 032B -
   E              F7                           dopo questa istruzione avrò sempre e            0324 = 07. Notiamo subito che 07 è il 2°

                                                                                                                                        57
```

## Pagina PDF 58

```text
Tabella 15 - Tavole di conversione da numeri in codice decimale a numeri in complemento a due
e viceversa.                                                                                       Index X
NUMERI NEGATIVI



I~
                                                                                                      In questo paragrafo introduciamo un
     ra
                 o    t    2   3    4    5     6     7    8    9    A   B    e    D    E   F       nuovo registro interno alla CPU: il regi-
                                                                                                   stro indice X.
      8         128 127 126 125 124 123 122 121 120 119 118 117 116 115 114 113                       Fino ad ora della CPU abbiamo visto
      9         112 111 110 109 108 107 106 105 104 103 102 101 100 99 98 97                       tre soli registri: l'Accumulatore A, il Pro-
      A          96 95 94 93 92 91 90 89 88 87 86 85 84 83 82 81                                   gram Counter P.C., e lo Status P. Vedre-
      B          80 79 78 77 76 75 74 73 72 71 70 69 68 67 66 65
      e          64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 49                                   mo che c'è ne sontJ ancora tre; comin-
      D          48 47 46 45 44 43 42 41 40 39 38 37 36 35 34 33                                   ciamo ad esaminare il primo di questi.
      E          32 31 30 29 28 27 26 25 24 23 22 21 20 19 18 17                                      Il registro indice X è un registro di
      F          16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1                                            8 bit sul quale è possibile eseguire dei
                                                                                                   calcoli, o, cosa più importante, indiriz-
                                                                                                   z.are la memoria con metodi nuovi rispet-
NUMERI POSITIVI                                                                                    (o a quelli visti fino ad ora.


~
                                                                                                      Analizziamo prima questo ultimo a-
  o  ra
                      t    2   3    4    5     6     7    8    9    A    B   e    D    E   F       spetto considerando il metodo di indiriz-
                                                                                                   zamento tramite il registro X.
o  o                  1 2 3 4 5 6 7 8 9 10 11 12 13 14 15                                             Premettiamo che le istruzioni che usa-
      1          16 17 18 19 20 21 22, 23 24 25 26 27 28 29 30 31                                  no questo tipo di indirizzamento sono
      2          32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47                                   sempre formate da due byte, di cui il
      3          48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63                                   primo è come sempre, il codice opera-
      4          64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79
      5          80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95                                   tivo, il secondo è un byte così detto di
      6          96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111                       spostamento (in inglese disp/acement).
      7         112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127


                                                                                                   lndirizzaml~i1to in pa~ina zero
                                                                                                   indicizzato
byte dell'istruzione di branch. Esso rap-          Ora basterà semplicemente battere sulla
presenta, come si suol dire, il "displa-           tastiera nella successione:
cement" del Program Counter ed è relati-                                                           Per i codici operativi di questa istruzione
vo al P.C. medesimo, è cioè indipendente              1) la parte bassa (2° byte) dell'indiriz-    si faccia riferimento anche alla tabella
dalla locazione di memoria nella quale             zo di partenza: 22.                             riassuntiva di tutte le istruzioni del 6502
abbiamo cominciato a caricare il program-             2) la parte bassa dell'indirizzo a cui si    pubblicata in questo capitolo.
ma (per esempio il programma può girare            vuole saltare: 2B.                                 Usando il sistema di indirizzamento
anche se caricato alla locazione di me-               Sul display indirizzi comparirà 222B e       indicizzato, l'indirizzo della locazione di
moria 0210 invece che alla 0320). Lo               sul display dati il numero 07, che è il         memoria sulla quale si vuole operare,
stesso conto per spostare il Program                                                               vien~ calcolato dalla CPU sommando il
                                                   valore relativo al salto nel sistema com-
Counter può essere fatto nel salto negativo        plemento a due.                                 contenuto del secondo byte dell'istruzio-
(ultima istruzione). In questo caso bisogna                                                        ne con il contenuto del registro indice,
saltare dalla locazione 032F, dove si trova           Stessa procedura per il salto all'indie-     senza tener conto del Carry. Il risultato
posizionato il P.C., alla 0326. Vale allora        tro: battete sulla tastiera 2D (l'istruzione    di questo calcolo (che avviene sempre
la relazionP "ciisolacement" = '11326 -            BEQ INDI è infatti all'indirizzo 032B           in codice esadecimale) è un numero da
032F = -(032F ~ 0326) = -09 = F7,                  poi 26 (infatti bisogna saltare alla loca-      8 bit che rappresenta la parte bassa del-
che è appunto il 2° byte della istruzione          zione 0326) e otterrete il risultato cerca-     l'indirizzo essendo la parte alta 00 per-
BEQ INDI. In pratica quando scriviamo              to F7.                                          chè si opera in pagina zero.
un programma lasciamo uno spazio                      Il tutto, come si è visto, è molto sempli-       Per chiarire meglio le idee vediamo
bianco dopo le istruzioni di Branch: il            ce: ogni volta che serve basta richiamare       subito un esempio pratico.
valore del salto viene definito a conclu-          questo programma che è sempre li, re-               Ammettiamo che sia X = 3B (regi-
sione del programma.                               gistrato permanentemente nella PROM             stro indice X = 3B). Se si esegue la
   Per calcolare i numeri positivi o negati-       del Monitor.                                    istruzione
vi che rappresentano le entità del salto si
                                                      Si fa notare infine che i salti in avanti    B5     LDA 02, X
può utilizzare con vantaggio un comodo
programma (presente del Monitor) che fi-           e indietro possono essere fatti nel campo       02
no ad ora non abbiamo adoperato, ma che            dei numeri positivi e negativi del sistema
                                                                                                   la CPU calcola l'indirizzo della loca-
è stato previsto proprio per questo scopo.         complemento a due; per salti più lunghi
                                                   si associa alla istruzione di Branch quella     zione di memoria il cui contenuto viene
   Questo programma parte dalla locazio-                                                           portato in accumulatore eseguendo la
ne di memoria FF97. Premiamo allora i              di JMP (salto incondizionato) che con-
                                                                                                   operazione
                                                   sente di andare in qualsiasi punto del-
tasti I AD I FF97 [RuN I.                          l'intera memoria.
                                                                                                   38 +    (contenuto dell'indice X)
   A questo punto riprendiamo per esem-               In particolare osserviamo che il pro-        02 =    (2° byte dell'istruzione)
pio il programma che abbiamo preceden-             gramma per il calcolo del salto che abbia-      30      (indirizzo della locazione di me-
temente analizzato: il primo salto (BPL            mo descritto permette di eseguire salti in              moria interessata)
AVA 1) doveva essere fatto dalla locazio-          avanti fino a+ 129 posizioni e indietro fino
ne 0322 (con questo metodo non dobbia-             a -126 posizioni (127+2=129 e -128+2=              N.B. B5 è il codice operativo della
mo tener conto della posizione del P.C.             V= - 126 poiché il programma tiene conto       istruzione LDA con il sistema di indi-
 poiché ci pensa il programma) alla 0328.          delle due posizioni più avanti del P.C.).       rizzamento in pagina zero indicizzato.

58
```

## Pagina PDF 59

```text
   La domanda che sorge ora è l'uso che        sistema di numerazione esadecimale an-
si può fare di questo sistema.                 che se la macchina è in funzionamento                                START
   Innanzitutto premettiamo che esiste un      decimale. Dato che devo portare a zero
certo numero di istruzioni che operano         16 locazioni di memoria mi chiedo se
su X che sono:                                 X = 1016 (questa uguaglianza verrà veri-
CPX: Confronto di X con un numero.             ficata al 17° passaggio, infatti 1016 = 1710)
DEX: Decremento di uno il valore di X          e cioè se ho finito il mio lavoro (ad ogni
(X = X - 1).                                   loop X si incrementa di uno oerchè
INX: Incremento di uno il valore di            s1 passa attraverso l'istruzione INX). La
X (X= X+ 1).                                   istruzione seguente è quella di Branch
LDX: Carico X con un certo valore im-          e viene eseguita se X non è uguale a
mediato o no.                                  10. Ricordiamo che F9 significa - 7, la                           ACC: ,;
STX: porto il valore di X in una certa         CPU cioè riparte da 7 byte indietro cioè
locazione di memoria.                          dalla prima istruzione del loop.
TAX, TXA: porto il contenuto dell'ac-              Notiamo che con questo programma
cumulatore in X e viceversa.                   si è eseguita una operazione di STA per
   Detto questo vediamo di risolvere un        16 volte successive, sempre in posizioni
semplice problema che utilizzi queste          diverse e con pochissime istruzioni. Ab-
istruzioni: scrivere un programma che          biamo fatto un loop, come si dice in
porti a zero tutte le locazioni di memoria     inglese, incrementando ad ogni gii::o
comprese fra 0020 e 002F. Si noti che          l'indirizzo dj memorizzazione del dato.
questo tipo di operazione viene normal-        cosa resa possibile dal sistema di indiriz-
mente fatto nei programmi di inizializ-        zamento indicizzato. Ripetiamo ancorn
zazione di un elaboratore all'atto della       una volta che stiamo operando con loca··
accensione.                                    zioni di memoria site in pagina zero.
   Il diagramma di flusso del programma                                                                            X:X+1
 può essere quello rappresentato in fig. 39.
Scriviamo allora il seguente programma:
0200           A2 LDX %00              Carico X con 0 in modo immediato
     1         00
    2          8A TXA                  Copio il contenuto di X in Accumulatore
    3 Loop     95    STA 20,X                                                                           NO
                                       Memorizzo il contenuto dell'Ace. nella locazio-
    4          20                      ne d1 memoria X + 20
     5         E8 INX                  Incremento X (X = X+ 1)
    6          E0 CPX %$10             Confronto X con 10, cioè X = 10?
    7          10
    8          D0 BNE LOOP             Se X non è uguale a 10 tomo ad eseguire la istru-
     9         F9                      zione STA                                                                    STOP
     A         4C JMP Monitor Stop
     B         22
     C         FE                                                                                      Fig. 39 - Diagramma di flusso
   Scrivete il programma nell' AMICO                                                            per l'azzeramento di una zona di memoria_.
2000A, fatelo girare e controllate che
tutte le locazioni di memoria dalla 0020         Lo stesso programma può essere scrit-
alla 002F contengano ora 00.                  to  almeno in altre due maniere diverse
   Il programma può sembrare un tantino risparmiando qualche istruzione, prova-                 domanda che ha sempre due risposte,
complicato, vediamo allora di descriverlo teci.                                                SI e NO. Questo blocco ha dunque un
in modo discorsivo in modo da com-                                                             mgresso e due uscite, una uscita per
prendere ogni passaggio.                                                                       il SI e una per il NO.
   Per prima cosa si è caricato nell'index     II Folw-Chart                                      Il blocco 1 caratterizza le operazioni
X il numero 00 (dato immediato), quin-                                                         di ingresso e di uscita dall'elaboratore.
di, siccome ci interessa che anche nel-                                                        Ad esempio lo si usa per indicare il
l'accumulatore ci sia 00 si copia il con-         Le operazioni logiche che si eseguono        prelevamento di un dato da una tastiera.
tenuto di X in accumulatore.                  nella stesura di un programma possono            I blocchi 4 e 5 verranno descritti in una
   Questo è stato fatto per risparmiare venir rappresentate tramite un sistema                 altra sede. L'incrocio indicato al punto
un byte di programmazione (l'alternativa grafico detto dei diagrammi di flusso o               6 è chiaro: esso indica un punto di rientro
 era LDA 00, cioè A900 = 2 byte) . A flow-chart. Questo sistema è molto utile                  su un altro flusso, quando, per esempio
questo punto mizìa un "loop", che viene       per rappresentazioni visivamente imme-           si effettua un rientro da un test (blocco
identificato con una etichetta sulla prima    diate e comprensibili di un programma            3). Il simbolo al blocco 7 indica l'inizio
istruzione, che è STA e cioè il trasferi-     e utilizza dei simboli grafici come quelli       o la fine di un programma.
mento del contenuto dell'accumulatore         rappresentati in fig. 40                            Generalmente quando si affronta un
nella locazione di memoria il cui indiri-         Alcuni di questi simboli sono già stati      problema di programmazione per prima
rizzo è 20 + X. Al primo passaggio di          visti; di essi sono particolarmente interes-    cosa si stende una sequenza logica di
questo giro (loop) questa locazione sarà      santi i blocchi 2 e 3. Il 2 indica una ope-      operazioni che risolvono il problema
0020 + 00 = 0020 e cioè la prima loca-        razione che bisogna eseguire che in gene-        usando i diagrammi di flusso. Questi
zione di memoria che deve essere portata      rale può essere indicata come aritme-            diagrammi sono immediatamente èom-
a zero. A questo si incrementa il con-        tica o di movimento dati; questo blocco          prensibili e di facile correzione. U van-
tenuto del registro indice X di uno. Si        ha un ingresso e una uscita.                    taggio che offrono è che la stesura del
noti che con questa istruzione (INX) il           Il blocco 3 è quello decisionale; sta        diagramma è indipendente da come
contenuto di X viene incrementato nel         ad indicare una domanda che ci si pone,          verrà scritto il programma effettivo; per

                                                                                                                                        59
```

## Pagina PDF 60

```text
esempio è indipendente dal particolare
set di istruzioni della CPU che poi ese-
guirà il programma.                                            1                                    INGRESso/USCITA
   Una volta verificata la correttezza delle
operazioni logiche descritte nel diagram-
ma di flusso si può cominciare a scrivere
il programma stesso nel linguaggio della
macchina che si vuole utilizzare. Il primo
passo è sempre il più importante perchè                        2                                    OPERAZIONI ARITMETICHE
è quello che risolve effettivamente il                                                              E MOVIMENTO DATI
problema. Il secondo è solo la fase rea-
lizzativa del tutto. Se infatti' supponiamo
di avere un programma scritto in lin-
guaggio Assembler per un certo micro-
processore diverso dal nostro, ci accor-
geremmo subito che è estremamente                              3                                    DECISIONI
difficoltoso riscriverlo nel linguaggio del
nostro computer. Se però abbiamo il
flow-chart relativo a quel programma
riscriverlo sarà una cosa molto semplice.


                                                              4                                     SUBROUTINE
Le istruzioni del 6502


       In questo capitolo è riportata una
tabella che riassume tutte le istruzioni
del microprocessore 6502 utilizzato nell'
                                                               5
                                                                             o                      PUNTO DI CONNESSIONE




                                                                    ~
AMICO 2000. Di tutte le istruzioni ri-
portate molte vi sono ormai note. Oltre                       6
che per ricordare i vari codici operativi,                                                          RIENTRI
la tabella fornisce altre importanti indi-
cazioni.
      Vediamo come si legge.
       Nella prima riga in alto sono riportati
i vari sistemi di indirizzamento, alcuni
                                                              7     (                  )            PUNTO DI INIZIO O FINE
 dei quali sono stati già analizzati.
       Nella seconda riga troviamo, dopo la        Fig. 40 - Simboli grafici usati nella costruzione di un programma per mezzo del flow-chart.
rappresentazione mnemonica della istru-
zione e l'operazione ad essa associata,
tre simboli di cui diamo il significato:
OP sta per Codice Operativo                                                                       13 93+
N è il numero di byte che formano la             Esercizi                                         72 75=
istruzione:
 -:\\- rappresenta il numero dei cicli mac-                                                       scomponiamo
china (Nel caso dell' AMICO 2000 il nu-                                                                 93+
mero dei microsecondi impiegati per                  Questa volta vi faremo fare un po'                 75=
eseguire l'istruzione).                          di esercizi per abituarvi a prendere con-
       Nell'ultima colonna di questa stessa      fidenza con le istruzioni fino ad ora            [[]    68

                                                                                                         ~3+
riga sono riportati i nomi dei bit dello         imparate.
Status che abbiamo già analizzato. Se
l'istruzione influenza qualcuno di que-
sti bit, in corrispondenza si vede un segno
v, diversamente appare un trattino -.
                                                    Per questi esercizi non vi daremo qui
                                                  la soluzione, ma la pubblicheremo alla
                                                 fine del prossimo capitolo.
                                                   1° esercizio - Scrivere un programma
                                                                                                   L 86
                                                                                                        72+
                                                                                                        1 =

       Per meglio comprendere facciamo un                                                         il risultato finale è 8668.
esempio pratico.                                 che esegue la somma di due numeri                    Utilizzare lo stesso metodo per scri-
       Si voglia tradurre l'istruzione LDA       ciascuno da due byte (le somme che                vere il programma tenendo presente an-
%$05.                                            abbiamo fatto fino ad ora sono sempre             cora un volta che il Carry è automatico
       Dalla tabella vediamo che si tratta       state fra due numeri di 1 byte ciascuno)          e che in quattro successive locazioni di
  di una istruzione di 2 byte, che viene         e positivi. Estendere poi il programma            memoria potreste mettere rispettivamen-
eseguita in 2 µs, il cui codice (per lo          a numeri di più byte.                             te il 1° e il 2° byte del primo numero
indirizzamento immediato) è A9 e che                Per aiutarvi ricordiamo che se la som-         e il 1° e il 2° byte del secondo numero;
influenza i bit N e Z.                           ma di due numeri ha un riporto questo             in altre due locazioni di memoria succes-
       La traduzione di questa istruzione in     va automaticamente nel Carry. Se ad               sive potreste mettere il 1° e il 2° byte
 linguaggio macchina è quindi semplice:          esempio scriviamo 93 + 75, il risultato           del risultato.
 A9 05.                                          è di 1 68 cioè 68 e 1 nel Carry. Se ora              Sviluppando il programma per la som-
       I simboli che compaiono nella colonna     sommiamo due numeri formati da quat-              ma di numeri di più byte vi facciamo
  OPERAZIONE verranno spiegati via via           tro cifre come 1393 + 7275 potremmo               notare che un numero di 4 byte arriva
  che verrà analizzata l'istruzione.             fare come segue:                                  a 4 miliardi!

 60
```

## Pagina PDF 61

```text
Tabella riassuntiva delle istruzioni del microprocessore 6502
                                 ISTRUZIOllE                                       IMMEDIATE      ASSOLUTE          ZERO PAGE             All:UM.             IMPUED            (110.X)       OID). Y       Z, PAGE X        ABS, X           ABS, y           RELATIVE        llDIRECT         Z, PAGE, Y                COIDITIOI CODES
     MINEMONICO                                      OPERAZll*E                    OF N % OP N % O~ N % OP N % OP N % OP N % OP N% OP N% PP N \liOP N \li OP N% OF N -\li OF N-\\i N                                                                                                                                  z c               I       o           V
     ADC             A+M+C -                         A              (4) (1) 69 2                2 60 4          3 65' 3              2                                        61 6        2 71 5    2 75 4              2 70 4           3 79 4          3                                                          I I I               -       -         I
     AN O            AAM-A                                                (1)      29 2         2 20 4          3 25 3               2                                        21 6        2 31 ·5   2 35 4              2 30 4           3 39 4          3                                                      I     / -                   -   -             -
      A ·s L             e-e;·~
                                                                                                  GE 6          3 <16 5              2 <IA 2        1                                                       16 6        2 1E 7           3                                                                      /    / -·/              -       -           -
     B cc            BRANCH 'ON C=0                                                                                                                                             i                                                                            9(1 . 2       2                                    -    -          -       -       -           -
     B C S           BRANCH ON C = 1
                                                                          '"
                                                                          (2)                                                                                                                                                                                B0 2          2                                    - - - - -                                   -
     BE Q            BRANCH ON Z • 1                                      (21                                                                                                                                                                                F0 2          2                                    - - - - -                                   -
      BIT                A A M                                                                    2C 4          3 24 3               2                                                                                                                                                                          M1       v'     - - - Me
      B MI               BRANCH ON N = 1                                  (2)                                                                                                                                                                                3<1 2         2                                    -    - -          -  - -
      B NE           BRANCH ON z - a                                      (2)                                                                                                                                                                                p0 2          2                                    -    - -                -       -           -
      B P L          BRANCH ON N= <I                                      (2)                                                    !                                                                                                                           10 2          2                                    -    -          -       -       -           -
      B R K                                                                                                                                                 0Q 7         1                                                                                      i                                               -   - 1 - -
                                                                                                                                                                                                                                                                                                                     -
--                      - - --   ·                                                                                                                                                                                  '
      BVC            BRANCH ON V=G                                        (2)                                                                                                                                                                                50 2          2                                    - - - - - -
      B VS               BRANCH ON V= 1                                    (2)                                                                                                                                                                               70 2          2                                    - - - - - -
                                                                                                                                                                                                                                                                                                                - -
----
      c L c
      C LO
                      " -
                     ·-·
                     0 -
                                 c
                                 o
                                                                                                                                                            1S 2
                                                                                                                                                            DE 2
                                                                                                                                                                         1
                                                                                                                                                                         1
                                                                                                                                                                                                                                                                                                                    " - - -
                                                                                                                                                                                                                                                                                                                - - - - 0 -
      CL I           0 -         I                                                                                                                          5S 2         1                                                                                                                                      -    -          -       0       -           -
~·    --           - -                                                                                                                                                                                                                                                                                                                                     -
      C LV           0 -         V                                                                                                                          BE 2         1                                                                                                                                      -    -          -       -       -           0
 ----

      C M ~              A-M                                               (1)     C9 2         2 C[ 4          3 c~ 3               2                                        C1 6        2 01 5        2 05 4          2 DC 4           3 09 4 13                                                              I    I          I       -       -           -
,___,__.
      C P X              X-M                                                       E0 2         2 EC 4          3 E4 3               2                                                                                                                                                                          I    I          I       -       -           -
      c    ~   v     Y-M                                                           c0i 2        2 cc 4          3 C' 3               2                                                                                                               I                                                          I    /          I   - - -
      DE C               M- 1 -                  M                                                CE 6          3 ce 5               2                                                                      06 6        2 DE 7           3                                                                      /    I          - - - -
      DE X               X - 1 -                 X                                                                                                          CA 2         1                                                                                                                              i       I    /          - - - -
      DE Y               y - 1 -                 v                                                                                                          ss 2         1                                                                                                                              i       I    /          -       -       -             -
      E OR               A'll'M -                A                         cn 49 2              2 40 4          3 45 3               2                                        41 6        2 51 5        2 55 4          2 50 4           3 59 4          3                                                      /    I          -       -       -             -
      IN f:              M + 1 -M                                                                 EE 6          3 E6 5               2                                                                      F6 6        2 FE 7           3           I                                                          /    I          -       -       -             -
      IN X               X+ 1            - x                                                        i                                                       ES 2         1                                                                                                       I     '          I             I    /          -       -       -             -
      IN Y               y + 1 -v
                                                                                                                         '                     '            ce 2         1                                                                                                                                      /    I          - - - -
- JMp                                                                                                                                                                                                                                                                                                                                 ·-
            JUMP TO NEW LOC                                                                       4C 3          3                                                                                                                                                              6C 5         3                   -     -         - - - -
- - ---- - -JUMP
             - SUB                                                                                                                                                                                                                                                                                              -    -          - - - -
      J S R                                                                                       2Q 6          3                                                                                                                                                                                       i
      L DA               M -         A                                     (1)     AS 2         2 AC 4          3   A~       3       2                                        A1 6' 2 B1 5              2 B5 4          2 BC 4           3 B9 4          3                                                    I      /          -       -       -             -
      LO X               M -         X                                     ( 1)    A: 2         2 AE 4          3 AE 3               2                                                                                                       BE .4       3                                      B6 4        2 /      I          -       -       -             -
      LO Y               M -         Y                                     (1)     A~ 2 2 AC 4                  3   A~       3       2                                                                      B4 4        2 BC 4           3                                                                    /      /          -       -       -             -
                                                                                                                                                                                                                                               '
      L S R              g.~.:.-:!).ç
                                                                                     I            4E 6          3 4E 5               2 4A 2             1                                                   56 6        2 5E 7           3                                       i                              ~    I          / - - -
      NO P               NO OPERATION                                                                                                                       EA 2         1                          I                                          !                                                                -     -         - - - -
      ORA                A V M -                     A                             <19' 2       2 <IC 4         3 0~ 3               2                                        01 6        2 11 5        2 15 4          2 1D 4           3 191 4         3                                                      I     /         - - - -
      P HA               A -         Ms                           S-1 -        S                                                                            48 3         1
                                                                                                                                                                                    i
                                                                                                                                                                                                                                                                                                                - .. -          -       -       -             -
      p H p              P -     Ms                               S-1 -
                                                                          - -
                                                                               S                                                                            DS 3         1      !
                                                                                                                                                                                                                    :                                                                                           -     -         -       - ---  -
                                                                                                                                                                                                                                                                                                                                                    -
                                                                                                                                                                                                                                                                                                                                                       -
      P LA               s+ 1-           s                        Ms ...... A
                                                                                                            I                                               6S 4         1
                                                                                                                                                                                                                                                                       I
                                                                                                                                                                                                                                                                                                                /     /         -       -      -
                                                                                                                                                                                                                                                                                                                                          --- ··-·- ·-
                                                                                                                                                                                                                                                                                                                                                       -
       p L p             S+ 1 -              s                    Ms.-+ P                                                                                   2S         4 1                                                                                                                                                    Ripristinato
-- -                                                                                                                                                                                                                                                                                                                                                    - - -----
                                                                                                                                                                                                                                                                                 l                              I    I          /           -   -             -
      R O L              ~                                                                        2E 6          3 26 5               2 2A 2             1                                                   36( 6       2 3E 7           3                                                        ''
      R OR               ~                                                                        6E 6          3 66 5               2 6A 2             1                                                   76 6
                                                                                                                                                                                                              1         2 7E! 7          3                                             I          I'            /    /          /           -   -             -
          R TI           RTRN. INT.                                                                                                                         40 6         1                                                                                                                                                    Ripristinato

      R T S              RTRN SUB                                                                                                                           60 6         1                                                                                                                                      - -             - - - -
                                         --
      S B C              A- M- C -                   A                     (1)     E9 2         2 EC 4          3   E~       3       2                                        E1 6        2 F1 5        2 F5 4          2 FD 4           3 F9 4          3                                                      I    I          (3)         -       -       I
      SE C  1 -                      c                                                                                   I                                  3E 2 , 1                                                                                                                                            -        -       1      -       -             -
 -- ----- ,..
      SE O               1 -         D                                                                                                                      FE 2         1                                                                                                                                      ~        -       -          -       1         -
          SE I           1 -         1                                                                                                                      78 2         1                                                                                                                                      -        -       -          1       -         -
 ----~               1-- - - - - -- -                                                                                            ~-- -
                                                                                                                                         - --- - - -- - 8-~si2 9 1 6 2 9 5 1 4
      STA                A -         M
                                             ·---------
                                                                                                  so 4
                                                                                                            '
                                                                                                                3   ss 3· 2
                                                                                                                    ~86      --- ·- --                                                       - -1-- ~+-                 :__~.?J. 5       3 99 5          3             '                                        -        -      -       -           -         -
       S T X             X -         M                                                            SE 4 ! 3                   312                                                    I               I - ·e-I                         I
                                                                                                                                                                                                                                                                       i ·-                     96, 4       2   - - - - - -
                          -·                                              --                                                                        -       1· -   -     --                                   --                --                                                   ·- '                                   -- --·
       S T Y             Y -         M                                                            se 4          3 S4 3               2                                                                      94 4        2                                                                                       - - - - - -
       T A X             A -         X                                                      I                                                               A~. 2        1                     I                                                                                                                ..; / - - - -
                                                                                                                                                                                               I
       T A Y             A -         y                                                I                 i   i                                               AfÌ 2        1                          I                                                                                                           /        /          -       -       -           -
     ----- - -                   - - - ·- - - - -                                                                                                                                                                                                                                                                                                   --
 --- -
      T S X              S -         X                                                                                                                      BA 2         1                                                                                                                                      /        /          -       -       - -
       T X A             X -         A                                                                                                                      SA 2         1                                                                                                                                      /        :;~~

       T X S             X -         S                                                                      i                                               9A 2         1
                                                                                                                                                                                    i i                                                                                                                         -        -       -      -           -         -
       TYA               Y -         A                                                                      l                                                98 2        1          I                                                                                                                           /        /          -   -           -         -
  (1)       Aggiungere 1 a " N" se si passa no i limiti di p agina.                                                  X               Regis tro Indice X                                                 +         Somma.                                               M1       Bit 7 d ella loc . di
  (2)       Aggiungere 1 a "N" se il BRANCH rimane nei limiti della                                                  y               Registro Indice Y                                                  -         Differenza.                                                   memoria (MSB).
            pagina. Aggiungere 2 a MN" se il BRANCH avvien e su                                                      A               Accumulatore                                                       A      ANO.                                                    Ms       Bit 6 della loc .
            un 'altra p agina.                                                                                                                                                                                                                                                  di memoria.
                                                                                                                     M               Locazione di memoria d ell'indirizzo                               V      OR.
  (3)       Carry Negato "" BORROW.                                                                                                  eff ettivo                                                                                                                        N        N. di c icli.
                                                                                                                                                                                                        V      OR escl usivo.
  (4)       Se si è in funzionamento " DECIMALE" il Flag Z non è valido.                                             M,              Locaz. di m emo ria puntat a dallo                                                                                                %        N. di Bytes
            Bisogna es eguire un t est dell'acc umulatore per rived ere                                                              STACK POINTER.
                                                                                                                                                                                                        /      Modificat o.
            il risultat o zero.                                                                                                                                                                         -         Non modificato .

                                                                                                                                                   METODI DI INDIRIZZAMENTO
 IMM - Indirizzamento Immediato. • L'operanda è contenuto nel 2~ byte dell'istruzione.                                                                                                      ABS, X - ABS, V Indirizzamento indicizzato assoluto. - L'indirizzo eff ettivo viene calcolato
                                                                                                                                                                                                 sommando il registro indic e al secondo ·e terzo b yte d ell'istruzio ne.
 ABS • Indirizzamento assoluto. - Il secondo byte dell'istruzione contiene gli 8 bit più bassi
     dell'indirizzo effettivo. Il t erzo b yte contiene gli 8 bit più alti dell'indirizzo effettivo .
                                                                                                                                                                                             (INO, X) Indirizzamento Indicizzato Indiretto. - Il secondo b yte dell'istruzio ne viene aggiunto
 Z Page - Indirizzamento in pagina zero. - Il sec o ndo b yte dell 'istruzio ne contiene gli 8 bit più                                                                                            al registro indice X (senza tenere c onto del carry). Il risultato punta su una locazione
      bassi de1t 'indirizzo effettivo. Gli 8 bit più alti sono zero .                                                                                                                             in pagina zero, c he contiene gli 8 bit più bassi dell'indirizzo effettivo. Il byt e successivo
                                                                                                                                                                                                   della pagina zero, co ntiene gli 8 bit più alti dell'indirizzo eff ettivo .
 A - Accumulatore. • Istruzioni da 1 byt e c he agiscono sull'accumulat ore.
                                                                                                                                                                                             (IND), V Indirizzamento indiretto indicizzato. - Il secondo byte dell'istruzione punta su una
 Z. Paga, X - Z. Paga, V. Indi rizzamento indicizzato in pagina zero. - Il secondo byte della                                                                                                      locazione in pagina zero. Il contenuto di questa locazion e di memoria viene aggiunto
      istruzione viene sommato al registro indice (il Carry vie ne ignorato) per formare                                                                                                           al registro indice Y. Il risultato è gli 8 bit più bassi dell'indirizzo effettivo. Il carry della
      byte basso dell 'indirizzo effettivo. Il Byte alto dell'indirizzo t)ffettivo è zero.                                                                                                         prima somma viene aggiunto al conte nuto della successiva locazione di memoria di
                                                                                                                                                                                                   pagina zero e il risultat o è gli 8 bit più alti dell'indirizzo effettivo .


                                                                                                                                                                                                                                                                                                                                                          61
```

## Pagina PDF 62

```text
   l3 esercizio - Scrivere un programma
che esegua la moltiplicazione di due              Programma 1 - Trasformazione di numeri decimali negativi e positivi in corrispondenti
numeri da 8 bit (1 byte).                       I nel sistema complemento a due.
   Il metodo più immediato, per tutto ciò
che fino ad ora avete appreso, è quello          0?00 =AS 11 FO oc A2 00 F8 18                      E8 6') 99 cc.7 00 DO F8 BA
di caricare il I 0 numero nell'index X e         0?·10 ::: 18 D8 Ab 10 FO O''I      c. 69 64        60 EA AB 29 OF AA BD EA
sommare l'altro tante volte quanto è             DPPO :.::FF 85 OF 98 4A 'tA 'tA 4A                 AA BD EA FF 60 EA EA EA
il contenuto di X; questo è possibile se
ad ogni loop si decrementa X. Atten-             OP30 :::At,1 OD AA 9~1 DO E8 ED 9F                 DO F<l A~' H 20 1A 02 85
                                                 OC.'ltO :.:: e:,• ·1 A5 OF 85 92 A~, ·12 20        ·1A 02 8~1 93 A~1 OF 8~1 94
zione però che X si decrementa (e in-
crementa) sempre in esadecimale.                 0250 ;:AS rn DO 04· A9 3F DO o···         c.       Ac:/ 06 e.~. 90 é~O "/E FF EA
   3° esercizio - Scrivere un programma           Oé.'.60 ';:FB ?O 2D FF' DO 04 8~·           DA    FD DD A~· DA DO cc Eb OA
                                                  02"70 ::/.\9  9l/ BD 03 FD 20 '.)/          FF    C9 ·1 ~. DO OC/ A9 40 45 BF
che carichi automaticamente dalla loca-
                                                  0280 :::85                ..' e e,• "10
                                                                8F 4C c,19 Oc..                     44 i,a AS 1 ·1 OA DA OA DA
zione 0000 alla 0050 numeri crescenti
in codice esadecimale dallo 00 al 50              Ol:~<7'0 ==26 rn 8~· 1"1 68 05 ·1 ·1
                                                                                              BO
                                                                                              8~1
                                                                                                    .,., A9 o ·1 25 rn 85      rn FO
(in pratica sul display dati si dovranno          OEAO == ·1 B  A~> 8F DO 0[> A5 n            C9    27 90 0~1 A9 27 8~1 "1"1 "18
vedere numeri sempre uguali alla parte            OPBO =:7'0    OA AS 1 ·1 C9 28 cm           F8    A9 C'7 DO F ·1 c'.D DO O"' c. A6
bassa dell'indirizzo fino alla locazione          OPCO ==8F     FO O~· 49 FF 38 6li'          00    8~> ·12 4C 3A O'' c. C<J ·12 DO
0050).                                            Dé.'.DO :::Ft:/
                                                                4C 30 02



Un gioco: il "master mind"
                                                  Programma 2 - Gioco del "master mind". Il programma deve essere fatto partire (RUN)
                                                  una volta caricato dalla locazione 82A9.

   Ed ora, dopo tanto lavorare con soft-
ware, istruzioni, esercizi etc., ci sembra       0200 =20 oc FF 20 2D FF DO 04 85 OD FO F4 A5 OD DO FO
opportuno un attimo di relax con un              0210 =E6 OD F8 A9 99 8D 03 FD 20 57 FF C9 15 FO .C.8 EA
giochino molto simpatico e molto cono-           0220 =EA EA EA C9 10 BO D9 A2 04 06 FA 26 FB CA DO F9
sciuto sotto il nome di "master mind".           0230 =05 FA 85 FA 4C 00 02 EA EA EA 48 29 OF 95 01 68
   Si tratta in sostanza di un programma         0240 =4A 4A 4A 4A 95 00 60 A5 FA A2 03 20 3A 02 A5 FB
che fa generare casualmente ali' AMICO           0250 =A2 01 20 3A 02 A9 00 85 09 85 OA AO 04 A2 01 El5
2000A 4 numeri diversi (o meglio un              0260 ==00 D5 04 DO oc. E6 09 D5 04 DO 02 E6 OA E8 EO 05
numero di quattro cifre) che dobbiamo            0270 =DO F5 20 85 02 88 DO E5 A5 09 OA OA OA OA 05 OA
indovinare. Si tratta di un gioco interattivo    0280 ==85 F9 4C 00 02 A2 01 85 00 95 FF E8 EO 09 DO F7
cioè di un gioco in cui il microcalcola-         0290 :::85 FB 95 FF 85 F7 95 FB 60 EA EA EA EA EA EA EA
tore dialoga con noi dando delle risposte.       02AO =A9 00 85 F9 85 FA 85 FB A2 05 18 F8 A5 oc 29 07
Come? Spieghiamo subito il gioco. Il             0280 =75 00 29 OF 95 DO C6 oc E8 EO 09 DO EF A9 00 85
.programma e riportato a fine capitolo.          02CO =OB A2 05 85 00 D5 01 DO OE 48 18 69 01 29 OF 95
(viene dato il cosiddetto codice oggetto)        02DO =01 68 E6 08 4C C1 02 E8 EO 08 DO E9 C6 08 FO 06
e si carica a partire dalla locazione di         02EO =20 85 02 4C C1 02 20 oc FF A9 99 8D 03 FD 20 57
memoria 0200.                                    02FO =:FF C9 12 DO 03 4C OD 02 4C A8 02
   Per farlo partire. una volta caricato.
bisogna posizionarsi all'indirizzo 02A0
poi premere RUN.
   A questo punto tutte le cifre del di-        sporremo in maniera differente fino a che      (qualche volta si tratterà anche di for-
splay lampeggiano con una frequenza ab-         il display dati non indica 44: questo          tuna, quella c'entra sempre!).
bastanza elevata: in questa situazione il       significherà che abbiamo trovato il nu-           Il programma è piuttosto lungo da
microelaboratore sta scegliendo le cifre        mero esatto scelto dal microelaboratore        inserire a mano, vi consigliamo quindi
che compongono il numero.                       (quattro cifre esatte tutte al loro posto).    di registrarlo subito, dopo averlo caricato
   Per arrestare questa operazione di ri-          Ricordate di battere sempre il tasto        la prima volta e averne verificato il buon
cerca dei numeri e per cominciare quindi        F dopo aver introdotto i nuovi numeri          funzionamento.
il gioco si preme il tasto C, a questo          per avere la risposta del microelaboratore.       Attenzione, un ultimo avvertimento:
punto tutte le cifre sono zeri.                    Per aiutarvi nei ragionamenti è meglio      il numero generato dal micro ha sempre
   Cominciamo il gioco battendo sulla           scrivere su un foglio di carta i numeri        tutte le cifre diverse; nel tentare di in-
tastiera una successione di quattro nu-         introdotti e la relativa risposta.             dovinarlo inserite sempre NUMERI
meri qualunque (all'inizio tutti possono           La bravura del giocatore sta nell'indo-     CON CIFRE UNA DIVERSA DALLA
essere quelli buoni) che appariranno sul        vinare con il minor numero di tentativi        ALTRA.
display indirizzi.
   Premiamo ora il tasto F. sul display
dati apparirà qualcosa (può rimanere
anche 00):
- La cifra a destra del display dati indica
quante cifre su quattro sono state indo-
vinate;
- la cifra a sinistra del display dati in-
dica quante cifre di quelle indovinate
sono al loro giusto posto.
   In base a queste indicazioni batte-
 remo sulla tastiera altri numeri o li di-

62
```

## Pagina PDF 63

```text
                                                         CAPITOLO VII




                    REGISTRO INDICE V E STACK POINTER




m         ancano ancora all'appello i due
          ultimi registri presenti nella
          CPU 6502. Essi sono il registro
indice Y e il puntatore di catasta operativa
(Stack Pointer) S.
                                               da paragonare a Y, il risultato di questa
                                               operazione non compare da nessuna
                                               parte in CPU, ma se questo risultato è
                                               zero automaticamente si ha Z = 1 (bit
                                               di zero dello Status), se il risultato è
                                                                                             con il sistema esadecimale) il contenuto
                                                                                             del registro indice Y. Il suo sistema di
                                                                                             indirizzamento è ovviamente implicito
                                                                                             (quando si scrive questa istruzione non
                                                                                             si deve precisare nulla di più alla CPU),
   L'interno della CPU, una volta esami-       negativo si ha N = 1 (bit di negativo dello   il codice operativo è 88, dalla operazione
nati questi ultimi registri si presenta fi-    Status), se il risultato è positivo si ha     vengono condizionati i bit di zero e di
nalmente completo; si faccia anche rife-       C = 1 (bit di Carry dello StatusJ.            ne~ativo dello Status.
rimento alla schematizzazione della CPU           Il dato da paragonare con Y può essere         Esempio: se si ha Y = 1, eseguendo
6502 apparsa nella parte sesta di questo       scelto in tre sistemi diversi di indirizza-   successivamente queste due operazioni:
capitolo.                                      mento.                                             88 DEY
                                                  Immediato (Codice operativo C0); il             88 DEY
                                               dato è nel secondo Byte dell'istruzione       si ha dopo il 1° DEY: Y=0, con N=0
                                               stessa.                                       e Z=l·
Il registro indice Y                              Per esempio:                               dopo Ù 2° DEY: Y=FF (cioé -1), con
                                                     C0 CPY # $7F                            N=l e Z=0.
                                                     7F                                      INY (lncrement Y). Valgono le stesse
   Si tratta di un registro ad 8 bit del       esegue il confronto fra il registro indice    cose dette per l'istruzione precedente.
tutto simile al registro indice X, di cui      Y e il dato "immediato" 7F.                   Il contenuto di Y viene incrementato
si è parlato nella sesta parte.                   Pagina zero (Codice operativo C4); il      di 1 in esadecimale, il codice operativo
   La differenza sostanziale del registro Y    dato di paragone è contenuto in una           dell'istruzione è C8, vengono influenzati
rispetto a quello X già trattato consiste      locazione di memoria in pagina zero.          Ne Z.
nelle possibilità di indirizzamento diver-        Per esempio:                                   LDY (Load Y). Con questa istruzione
se per i due registri. Esse sono: l'indi-            C4 CPY $04                              si carica un valore nel registro Y. Il valore
rizzamento indiretto indicizzato (possi-             04                                      da caricare può essere identificato con
bile tramite il registro Y); inoltre l'indi-      Il contenuto del registro indice Y viene   cinque diversi sistemi di indirizzamento,
rizzamento indicizzato in pagina zero          paragonato al· contenuto della locazione      alcuni dei quali sono stati già analizzati.
è possibile per il registro Y solo su due      di memoria 0004.                              Vengono influenzati i bit N e Z.
istruzioni e su molte di più per il re-           Assoluto (Codice operativo CC); il dato        STY (Stare Y). Con questa istruzione
gistro X.                                      da paragonare è contenuto in una qual-         si porta il valore di Yin memoria, lascian-
    Spiegheremo comunque in dettaglio          siasi delle possibili 65.536 locazioni di      do Y invariato. Questo trasferimento può
 in un prossimo capitolo questi sistemi        memoria indirizzabili dal 6502, della qua-     essere fatto operando in tre diversi siste-
di indirizzamento; per una prima spie-         le viene dato l'indirizzo nella seconda        mi di indirizzamento mentre i bit di stato
gazione si veda comunque la tabella            parte dell'istruzione.                         non vengono influenzati. Quest'ultima
riassuntiva delle istruzioni del 6502 pub-        Per esempio:                                particolarità è molto importante e deve
 blicata nel sesto capitolo.                         CC CPY $35D6                             essere tenuta presente per tutte le istru-
    Vediamo ora le varie istruzioni relative         D6                                       zioni che non influenzano i bit di stato.
all'indice Y:                                        35                                       Con gli esempi che seguono vogliamo
CPY (Compare Y). Paragone fra il con-             Con questa istruzione il contenuto del      dimostrare l'effetto di questa caratteri-
tenuto di Y e un numero.                       registro indice Y viene paragonato al          stica.
    Questo paragone lascia invariato Y t       contenuto della locazione di memoria              1u esempio: l'istruzione STY non in-
condiziona semplicemente i bit dello           numero 35D6.                                   fluenza i bit di stato.
 Stato. In pratica viene eseguita nella CPU       DEY (Decrement Y). Con questa                  Poniamo che sia Y=0 e sia contenuto
l'operazione Y - M dove M è il numero          istruzione si decrementa di uno (sempre        nella locazione 0005 il dato 'IJ7.

                                                                                                                                      63
```

## Pagina PDF 64

```text
                                                           PROGRAMMA                        PRINCIPALE


                                                                                          1° SALTO




                                    ISTRUZIONI
                                    COMUNI
                                                                                            2°SALTO         _,,,,,,. ,,,,,,.,.--........,
                                                                                                        /
                                                                                                    /
                                                                                                /

i
f
                                    ISTRUZIONI
                                    COMUNI
                                                                         /
                                                                             /
                                                                                  /
                                                                                      /
                                                                                            /



                                                                                                                                            (SUBROUTINE)
                                                                                                                                                                COMUNI




                                    ISTRUZIONI
                                    COMUNI
                                                                                                                                                            I
                                                                                                                                                        I
                                                                                                                                                    /
                                                                                                                                                /
                                                          ~........
     1° CASO - Le istruzioni comuni vengono                                                     ______ ____
                                                                      ........._ -... ......_....._2° RIENTRO               ...- ..,.,. /
                                                                                                                                            /

     ripetute tutte le volte che servono




      Fig. 41 - Rappresenta:ione J;ra/ìrn del
              concetw di .1 uhmut inc.




     Scriviamo il programma:                      quello della locazione ~ uguale a 07.                            memoria 0005 (che è 01) va subito a zero.
                                                                                                                   Ma l'istruzione LDY carica in Y un nu-
0200 Loop C6 DEC $05 Decrementa il                  Scriviamo il programma:                                        mero, 'IJ7, diverso da zero, ponendo
   1      05         contenuto del-                                                                                Z ~ 0 (bit delle Status di zero = 0).
                     la locazione di              0200 Loop C6 DEC $05 Stesso   com-                                  E allora solo quest'ultima istruzione
                     memoria 0005                    1   05            mento     pro-                              che determina la condizione di salto e
                                                                       gramma pre-                                 non la prima (DEC).
      2       84 STY $06 Memorizza il                                  cedente)                                       TAYe TYA (Transfer A- Ye Y- A).
      3       06         contenuto di Y                                                                            Queste istruzioni servono a trasferire il
                         nella 0006                                                                                contenuto dell'accumulatore nel registro
                                                     2         A4 LDY $06 Carica in Y il                           Y o viceversa. L'indirizzamento è im-
      4        D0 BNE           Salta se il ri-      3         06         contenuto del-                           plicito come al solito vengono influen-
      5        FA Loop          sultato di DEC                            la locazione di                          zati i bit di Status N e Z.
                                non è uguale                              memoria 0006
                                a zero (e NON                             (che è 7 -I= 0!)
                                se il contenuto
                                del registro Y       4         F0 BEQ                     Salta se il bit di
                                non è uguale a                                                                      Un esempio pratico
                                                     5         FA Loop                    Zè=l
                                zero!)

   2° esempio: l'istruzione LDY influenza         In questo esempio le cose vanno molto di-                            A questo punto verifichiamo nella pra-
i bit di stato N e Z.                             versamente, infatti se LDY non influen-                           tica, con l' AMICO 2000/ A, la funzione e
    Poniamo che sia il contenuto della lo-        ~asse i bit d_i stato faremmo subito un Loop                      l'uso di alcune delle istruzioni appena vi-
    cazione di memoria ~5 uguale a O e            m quanto Il contenuto della locazione di                          ste scrivendo un programma che fa ac-

64
```

## Pagina PDF 65

```text
cendere e spegnere il display con una                    Alla locazione 0208 comincia il primo    zero. Questo Loop viene eseguito 6 volte
intermittenza di un secondo circa.                    Loop che mi permette di caricare su sei     (si vede l'istruzione A2 06).
   Facciamo notare che in questo pro-                 locazioni di memoria successive un nu-         Loop di ritardo. Alla locazione 020D
gramma sono contenute delle subroutine                mero che è alternativamente 00 oppure       carichiamo il numero FF nel registro Y;
del monitor cui si fa riferimento nel pa-             FF (se è 00 il display è spento, se è FF    vogliamo far notare che prima di entrare
ragrafo hardware del prossimo capitolo.               ogni cifra indica il numero 8; si rimanda   nella subroutine di rinfresco del display
   Analizziamo brevemente di questo                   sempre alla spiegazione hardware del        (JSR FF7E) salviamo il contenuto del
programma, il cui listing è riportato nella           prossimo capitolo).                         registro Y nella locazione di memoria
Tabella 16 i punti che maggiormente                      Notiamo alla locazione 0208 il sistema   0010 (istruzione STY $10) perché la su-
 ci irlteressano.                                     di indirizzamento indicizzato in pagina     broutine stessa modifica, per come è stata
                                                                                                  costruita, anche il contenuto di Y. Al
                                                                                                  ritorno dalla subroutine quindi dobbiamo
                                                                                                  ripristinare questo contenuto (istruzione
                                                                                                  LDY $10) decrementandolo poi fino ad
                                   Memoria RAM                                                    arrivare a zero (istruzioni DEY e BNE
                                                                                                  Loopl).
                                                                              FASE~                   Questo Loop di rinfresco viene ese-
                                                                              STATO INIZIALE      guito FF volte (255 volte) e quindi per
                                                                                                  un certo tempo, che dipende dal tempo
                                                                                                  impiegato dalla CPU a eseguire la routine
                                                                                                  di rinfresco display, il display stesso rima-
                                       .X         X                                               ne acceso o spento a seconda che sia
                                                                        PAGINA 1                  stato scritto FF o 00.
                        S                X        X
          I 124 -· _ __...,.             X        X            ----+-----~a locazione libera          Si potrà quindi modificare la cadenza
                                                                                                  di accensione cambiando il valore con-
                                .....----------------~                                            tenuto nella locazione di memoria 020E:
                                                                                                  il tempo minimo di impulso si ha se scri-
                                                                                                  viamo en (il display in pratica lo vedremo
                                                                                                  sempre acceso data l'elevata frequenza
                                                                                                  dell'intermittenza), mentre il tempo mas-
                                                                                                  simo di impulso si ha se scriviamo 00.
                                                                                                   Perche? Lasciamo a voi la risposta.
                                                                                                      Come ultima particolarità facciamo
                                                                                                   notare che per passare alternativamente
                                                               X                                   da 00 a FF (cioé acceso/ spento del display)
                                                                                                   eseguiamo una negazione tramite l'istru-
                                                                                                   zione EOR # $FF del contenuto della
                                                                                                   locazione di memoria 0F (ricordiamo che
                                                                                                   00 EOR FF = FF; FF EOR FF = 00).
                                                                                                      Dobbiamo puntualizzare infine per i
                                                                                                   lettori più sofisticati che lo stesso pro-
                                                                            fASE 1
                                                                                                   gramma potrebbe essere scritto con un
                                                                            MEMORIZZAZIONE
       Memor.izzazione                                                                             numero inferiore di istruzioni.
                                             X.        X

                                             X         X
                            s
                                                       3



                                                                                                     L'uso principale di questo registro è
                                                                                                  dettato dal suo stesso nome, lo si usa

   S=m Decremento
                                                                              I FASE 2
                                                                                                  infatti per "puntare" in una certa zona
                                                                                                  di memoria, ciò permette alcuni nuovi
                                                                                                  sistemi di indirizzamento.
                                                                                                     Esaminiamo. per ora, due di questi
                                                                                                  indirizzamenti rimandando gli altri ad un
                                                                                                  paragrafo successivo.
                            s
            ;' 12 3             + . ..,___x___x_ _-4
            J.
            ,, 124 - - - - -                 •             3       1----       Valore di PC
                                                                               p~rte   alta
                                                                                                   Indirizzamento assoluto
                                                                                                   indicizzato

                                                                                                       Effettuato tramite il puntatore Y.
                                                                                                      Nella tabella riassuntiva delle istruzioni
                                                                                                   del 6502 è indicato come ABS,Y.
                                                                                                       Con questo sistema la CPU calcola
                                                                                                   l'indirizzo della locazione di memoria
                 Fig. 42 - Rappresentazione grafica del fw:zzionamento de!Ìo Stack ~ointer.        interessata sommando il valore assoluto

                                                                                                                                             65
```

## Pagina PDF 66

```text
      S=mMemorizzazione
                                                                             IFASE 3
                                                                                              portate X (STX) viene calcolato somman-
                                                                                              do, senza tenere conto del Carry, l'indi-
                                                                                              rizzo di pagina zero indicato nel secondo
                                                                                              byte dell'istruzione e il registro Y.
                                                                                                 Per esempio, se si ha Y = FF, l'istru-
                                                                                              zione:
                         s                                     . Valore di PC
                                .,.__ _ _ _ _ _ _ _ _..,:•----parte, bassa                    96STX15,Y
                                                                                              15
                                                                                              memorizza il contenuto del registro in-
                                                                                              dice X nella locazione di memoria 15 +
                                                                                              Y = 15+FF=14 (cioè0014,ricordiamo
                                                                                              che qui si è in pagina 0).
                                                                                                 Un altro uso altrettanto importante di
                                                                                              Y è come contatore.
                                                                                                 Si può per esempio caricarlo con un
                                                                                              valore ed eseguire una operazione molte

      &=~
                                                                                              volte successive decrementando il valore
                                                                             1. .FASE.4
                                                                                              di Y fino a farlo arrivare a zero. Questo
         De,crt~m~nto
                                                                                              può servire, per esempio, a generare dei
                                                                                              ritardi (come il ritardo della partenza
                                                                                              della sirena di allarme di un sistema di
                         s                                        1a locazione                antifurto).
                                ...,._ _....,_ _ _ _ _ _..,:·---- libera


                                                                                              Pointer di Stack e Subroutine



                                                                                                 Per introdurre il concetto di ST ACK,
                                                                                              spieghiamo brevemente cosa si intende
                                                                                              per Subroutine.
                                                                                                 Ammettiamo di dover eseguire un cer-
                                                                                              to numero di istruzioni più volte in punti
                                                                                              diversi di uno stesso programma. L'ap-
             Fig. 42 - Rappresentazione grafica del funzionamento dello Stack Pointer.
                                                                                              proccio più immediato sarebbe quello
                                                                                              di scrivere il gruppo di istruzioni in og-
                                                                                              getto ogni volta che ne abbiamo bisogno;
che forma il 2° e 3° byte dell'istruzione,                                                    questo comporterebbe ovviamente un
al contenuto del registro Y. Facciamo             Indirizzamento in pagina base               notevole dispendio di memoria oltre che
un esempio: sia Y = 3F.                                                                       di fatica a riscrivere ogni volta le stesse
l'ooerazione:                                                                                 cose.
79 ADC 0203, Y                                                                                   Un sistema più evoluto è invece quello
03                                                    Effettuato tramite il puntatore Y.      di abbandonare momentaneamente il
02                                                    Nella tabella è indicato come Z.PAGE.   programma principale, andare ad esegui-
esegue la somma del cmntenuto dell'ac-           Y.                                           re le istruzioni comuni, poi tornare al
cumulatore con il contenuto della loca-             Esiste solo per due istruzioni: la LDX    programma principale nello stesso punto
zione di memoria 0203 + Y = 0203 +               e la STX.                                    in cui lo abbiamo lasciato (Fig. 41).
+ 3F = 0242.                                        L'indirizzo della locazione di memoria       Per fare questo si memorizzano in
   Il risultato della somma va a finire          con il contenuto della quale si vuole ca-    una zona di memoria le istruzioni co-
nell'accumulatore.                               ricare X (LDX) o nella quale si vuole        muni, mentre si esegue un salto dal
                                                                                              programma principale ogni volta che è
 T?bel!a 16 ~rogramma per f~r la:qipeggiare il ~splay                                         necessario.
                                                                                                 Il problema che si presenta è come
 9299         ·A9 LDA #99                          1           20' JSR FFìE                   effettuare il ritorno. Se per esempio ac-
    1          99                                  2           7E                              cediamo alle locazioni comuni (Subro-
    2          85 STA $ftF                         3           FF                             utine) a partire dalla locazione di memo-
     3         9F                                  4           A4 LDY $10'                    ria 0300, dobbiamo tornare, una volta
     4 Loop 2 AS. LDA $ftF                         5           19 ,       ,                   che le abbiamo eseguite, a riprendere
     5         lJF .                               6           88 DEY                         il nostro programma principale a partire
     6         A2LDX=1l6                           '7          00 BNE Loòp 1                  dalla locazione 0303.
     7         Ò'6 . ' ..                          8           F6 . ·
     8 Lo~p    95 STA 8E,X                         9           A5 LDA $lJF                       Perché? Se l'istruzione "Salta alla su-
     9         8E                                   A          O'F     ~.   .                 broutine" (JSR) è posizionata alla loca-
     A         CADEX                                B          49 EOR#$FF                     zione 0300, possiamo ipotizzare una si-
     B         00 BNE Loop                          e          FF                             tuazione di questo tipo:
     e         FB                                   D          85 STA $lJF
     D         AlJ LDY #$FF                         E          f.JF
     E         FF                                   F          4C JMP Loop 2                        0300     20    JSR 0280
     F Loop 1 84 STY $19                        0'220'         0'4                                  0301     80
  9219         19                               922J           92                             PC -{)3()2     02
                                                                                                    0303     xx

 66
```

## Pagina PDF 67

```text
    Allora il Program Counter (PC), do-
po che il processor ha letto l'istruzione
(che è sempre formata da 3 byte) e
prima di averla eseguita si trova a pun-
tare la locazione 0302; a questo punto
il processor va a eseguire la subroutine
che comincia all'indirizzo 0280 e dopo
averla completata deve ricaricare il va-                         ~17 E - - -             X                X
lore 0303 nel PC per proseguire l'esecu-                                          1-----~---------1
zione del programma dal punto in cui
era stato interrotto. Il valore 0303 è l'in-
                                                                 ,17 F    ---11                           5
dirizio dell'istruzione successiva al JSR.                                        1--------------~-1
Tutta la procedura descritta avviene ogni
volta che si incontra la istruzione JSR,
                                                                 ,18~-                                    2
dovunque essa si trovi.                                                           L-------------------1
    Perché ciò avvenga il problema prin-
cipale quindi è: dove salviamo (memo-
rizziamo) il valore del PC prima di ese-
guire il salto?
    Nello STACK.
    Cosa è lo Stack?
    Non è altro che una zona di memoria
RAM situata in pagina 1 (indirizzi da                          S di partenza _.              1
0100 a 01FF). È all'interno di questa                                                                 8       -
zona che viene salvato (memorizzato)
automaticamente il PC su due locazioni

                                                                                                                  I
di memoria successive (ricordiamo che il
PC è un registro di 16 bit = 2 byte).
    A questo punto abbiamo bisogno del-                        s dopo il JSR = I 1 · 1 7                      E
lo Stack Pointer (Puntatore dello Stack),
un registro da 8 bit (+ 1 bit sempre a
1 perché siamo in pagina 1) che contie-                      Fig 43 - Esempio di .1alva1aRRio del PC e modifìca del contenuto
ne l'indirizzo della 1a locazione di memo-                      dello Stack Pointer dopo /'esern:::ione de/l'istruzione JSR.
 ria dello Stack nella quale dobbiamo
memorizzare o dalla quale dobbiamo
prelevare il PC che ci interessa salvare.
    L'unico problema ora è quello di as-                                                          Successivamente si decrementa ancora
segnare un valore iniziale (ovvero posi-       0302 02.                                        S e viene caricata la parte alta del PC
zionare) allo Stack Pointer - che d'ora        0303     xx                                     con il contenuto della locazione di me-
in avanti indicheremo anche con il solo          Dopo che l'istruzione è stata letta si        moria puntata, ripristinando il PC dal
 simbolo S -; la cosa nel caso dell' AMicO     ha il Program Counter:                          quale siamo partiti.
 2000/ A viene fatta dallo stesso program-                                                        Il procedimento è sostanzialmente l'in-
 ma del monitor, ma può essere fatta dal       PC= 0302                                        verso di quanto abbiamo illustrato nella
 programmatore con delle istruzioni speci-        A questo punto la CPU salva automa-          Fig. 42, in particolare alla fine di RTS
 fiche, come vedremo nel paragrafo suc-        ticamente nello Stack il valore del pro-        sarà ancora S = 124.
 cessivo.                                      gram Counter.                                      Abbiamo visto come la CPU abbia
    Vediamo ora di chiarire con degli e-          Questo avviene in varie fasi come            salvato in una zona di memoria ben
 sempi pratici tutto ciò che finora è stato    descritto nella Figura 42.                      identificata (tramite l'S) il punto da cui
 spiegato.                                        FASE 1 - La parte alta del PC (03)           è partita e come quindi sia in grado di
                                               viene memorizzata (salvata) nella loca-         riprendere dallo stesso punto l'esecuzio-
                                               zione puntata da S.                             ne del programma principale.
                                                  FASE 2 - S viene decrementato di uno.
                                                  F ASE3 - La parte bassa del PC (02)
Lancio di una Subroutine                       viene memorizzata nella locazione pun-
                                               tata da S.
                                                  FASE 4 - S viene ancora una volta
                                               decrementato di uno.                              Esempio di utilizzo di una Subroutine
   Esiste una istruzione specifica, come          Avvenuto ciò il PC viene caricato con
abbiamo precedentemente accennato,             il valore presente nella istruzione JSR
che permette di eseguire il salto a subro-     (0280) e l'esecuzione del programma ri-              Come esempio possiamo costruire un
utine presenti in memoria. Essa è:             prende da li.                                     semplicissimo programma che scrive una
JSR (codice operativo 20).                        Per tornare indietro, per uscire cioè          parola sul display dell' AMICO 2000/ A.
   Questa istruzione è seguita da 2 byte       dalla subroutine, si usa l'istruzione R TS,          Esiste una subroutine nel programma
contenenti l'indirizzo in cui comincia la      codice operativo 60, che è l'istruzione           di Monitor che accende il display secon-
subroutine interessata.                        che chiude tutte le subroutine.                   do una configurazione assegnata. In pra-
   Vediamo come opera la CPU.                     Come opera l'istruzione R TS?                  tica allora nel programma che stiamo
  Ammettiamo che sia S (Stack Pointer)            Quando la CPU incontra la R TS, auto-          per scrivere utilizzeremo una parte di un
= 124 (Fase zero della Fig. 42).               maticamente decrementa il valore di S.            programma precedentemente scritto per
  La CPU incontra l'istruzione:                Quindi carica la parte bassa dell'indiriz-        un suo preciso scopo, ma che è comun-
0300     20    JSR 0280                        zo del PC con il contenuto della loca-            que a nostra disposizione (bontà delle
0301     80                                    zione di memoria puntata da S.                    subroutine!).

                                                                                                                                       67
```

## Pagina PDF 68

```text
                                               ~
                                  Istruzione                                                                          Istruzione
                                                                                                                                   ~
                                                         1                                            ,1,,
                      ,..,,,                             ~,,

                                                                                                                l                         l
                                     PAGINA 1                                                                         PAGINA 1




 -    -       ,138
 s        t   ~ 139                      7 B                                                                                7 B



                      , .....                            ,......,



              ~1 FF

                          LO SPOSTAMENTO DI S AVVIENE
                                                                                                      ~1FF     T                          J
                                                                                                                LO SPOSTAMENTO DI S AVVIENE
                          DOPO IL SALVATAGGIO DI · ACC                                                          ~ . DEL CARICAMENTO DI ACC




                                        Fig. 44 - Rappresentazione graica del funzionamento delle istrnzioni PHA e PLA.



Il programma è il seguente:                                A questo punto potete far partire il       Come sempre in tutte le istruzioni di
                                                        programma dalla 0300.                      trasferimento il registro di partenza (S
0300 Loop 20 JSR FF7 E                                     Ora, se siete bravi, potete tentare di  nella I a istruzione e X nelja 2a) rimane
   1      7E                                            arricchire questo programma facendo ac-    invariato dopo l'esecuzione dell'istruzio-
   2      FF                                            cendere e spegnere il display in modo      ne.
   3      4C JMP Loop                                   intermittente con i loop di ritardo che       Vi renderete subito conto che l'unico
   4      00                                            abbiamo già esaminato.                     mezzo per caricare un valore nell'S con-
   5      03                                                Provate senza disperare alle prime     siste nel trasferirlo dal registro indice X.
                                                         difficoltà.                                  Ricordiamo ancora una volta che lo
   È quasi banale, ma molto utile: questo                                                          Stack Pointer S è un registro a 8 bit
programma non fa altro che visualizzare                                                            che punta in memoria su una locazione
in continuazione (tramite la subroutine                                                            di pagina 1. Se cioè si ha S = 8F, la
di rinfresco del display posizionata a                  Istruzioni che caricano lo Stack Pointer   locazione di memoria puntata è la 018F.
FF7t:) il contenuto delle locazioni di                                                             dove 01 è la pagina 1 e 8F è il contenuto
memoria 8F, 90, 91, 92, 93, 94 (situate in                                                         dell'S.
pagina zero) sulla 1a, 2a, 3\ 4a, sa, 6a                   Abbiamo visto l'uso dello Stack Poin-      Ora comincia a diventare chiara la ra-
cifra del display.                                      ter nella gestione delle subroutine. Vo-   gione per cui i nostri programmi comin-
   L'istruzione JMP Loop mantiene co-                   gliamo ora analizzare le istruzioni che ci ciano tutti da 0200.
stantemente il processor nella condizio-                permettono di caricare un certo valore
ne di far eseguire 'in continuazione la                                                               Conviene sempre tener libera la pagina
                                                        nell'S, cioè di modificarne direttamente 0 (locazioni 0000 + 00FF) per eseguire
subroutine di rinfresco.                                il contenuto. Questa operazione serve i calcoli poiché l'indirizzamento in pa-
   In definitiva per scrivere un qualcosa               essenzialmente all'accensione della mac- gina zero è molto semplice e richiede
su ogni digit del display basta memoriz-                china. Nel caso dell'AMICO 2000/ A ciò
zare un certo dato nella locazione di                                                              istruzioni di soli 2 byte. La pagina 1
                                                        avviene automaticamente nel program- invece è generalmente dedicata allo Stack
memoria corrispondete. C'è una proce-                   ma di Monitor che carica S = 1FF. In cioè a quella zona di memoria relativa
dura che permette di controllare uno per                generale non avremo . mai .biso~no ~i alle subroutine e, come vedremo a sal-
uno i sette segmenti di ogni cifra (digit)              modificare S, salvo che m casi parttcolan. vataggi di parametri diversi.
e che spiegheremo nella parte hardware                     Passiamo ad analizzare le istruzioni.
 del prossimo capitolo.
   Per ora vi diamo i dati per scrivere
                                                            ISX(Transfer Stack Pointer in X). Co-
la parola ASEL sul display.                              dice operativo BA.                              Due esercizi pratici
 Caricate:                                                  Questa operazione trasferisce il conte-
                                                         nuto dello Stack Pointer nel registro in-
  Indirizzo        Dato          Commento                dice X.                                            Prima di analizzare le altre istruzioni
008F              77            lettera A                                                                relative allo Stack Pointer facciamo un
     90           6D            lettera S                 TXS (Transfer X to Stack Pointer).             piccolo esercizio. Vogliamo esaminare
0091              79            lettera E               Codice operativo 9A.                             dove il microelaboratore AMICO 2000/ A
  92              38            lettera L                 Questa operazione trasferisce il conte-        ha lo Stack Pointer in un certo istante.
  93              00            cifra spenta            nuto del registro indice X nello Stack              Possiamo scrivere questo breve pro-
  94              00            cifra spenta            Pointer.                                         gramma:

68
```

## Pagina PDF 69

```text
Possiamo scrivere questo breve programma:                                                     PHP (Push Status). Codice operativo
                                                                                           08. Avviene la stessa cosa dell'istruzione
0"'00         BA     TSX Prelevo il valore dell'S e lo metto in X.                         precedente ma viene salvato il registro
    1         86     STX $00 Porto X nella locazione di memoria 00.                        di Status invece dell'Accumulatore.
    :i        00                                                                              PLA (Pull Accumulator). Codice ope-
    3         4C     JMP Monitor                                                           rativo 68.
    4         22                                                                              Con questa istruzione il contenuto
    )         FE                                                                           dell'S viene incrementato di uno. quindi
   Essendo questo programma in generale vedremo apparire sul display                       viene prelevato il contenuto della loca-
dati FF (ovvero S = FF). Cioè lo Stack Pointer è puntato proprio in cima                   zione puntata che viene portato in ACC
alla sua zona di azione: questo perché. come abbiamo accennato.                            (vedi Fig. 44).
viene caricato così nel programma di Monitor dell' AMICO 2000/ A.                             Se si ha S = 38. Loc. di memoria
                                                                                           0139 = 7B dopo l'istruzione PLA abbia-
                                                                                           mo:
                                                                                           S = 39. ACC = 7B.
                                                                                              PLP (Pull Status). Codice operativo 28.
                                                                                               Avviene la stessa cosa dell'istruzione
Vediamo ora un altro esempio scrivendo questo programma:                                    precedente. ma viene caricato il registro
                                                                                           di Status.
0200          A2     LDX#$80        Carico in X il numero 80.
   Jl         80                                                                               L'uso di queste istruzioni è evidente:
    2         9A     TXS            Lo trasferisco nello Stack Pointer.                    se si deve salvare il contenuto dell'accu-
    3         20     JSR $0300      Salto alla subroutine che inizia alla locazione 0300   mulatore perché dobbiamo utilizzarlo in
    4                                                                                      altre istruzioni. lo si può fare con questa
              00
                                                                                           semplice operazione di un solo byte.
    5         03
              xx                                                                              Chiedetevi ora perchè in una subro-
    6
                                                                                           utine è "proibito" eseguire un PHA sen-
                                                                                           za farlo seguire da un PLA prima di usci-
0300          BA      TSX           Trasferisco in X il valore che S ha assunto dopo       re dalla subroutine stessa con l'istruzione
                                    l'esecuzione dell'istruzione JSR                       RTS.
   1          86      STX $00        Memorizzo questo valore nella loc. 0000                  Facciamo adesso un esempio per ve-
   2          00                                                                           dere come si modifica in pratica il regi-
   3          4C     JMP Monitor                                                           stro S. Per non andare ad interferire con
   4          22                                                                           lo Stack del Monitor, spostiamo anche
   5          FE                                                                           l'S in una zona della pagina I.
                                                                                           Scriviamo il programma:
   Dopo aver fatto girare il programma
troveremo che lo Stack Pointer posizio-            0200           A2     LDX#$39
nato a 80. si è decrementato di due posi-             I           39
zioni (leggeremo infatti 7F sul display da-           2           9A     TXS          Carico lo Stack Pointer
ti alla locazione 0000).                              3           A9     LDA#$7B Carico 7B nell'accumulatore
   Ciò è dovuto alla esecuzione della                 4           7B
istruzione JSR che ha salvato il PC di                5           48     PHA          Porto il contenuto dell' ACC nello Stack
partenza nelle locazioni 0180 e 017F.                 6           BA     TSX          Porto Sin X
Se infatti andiamo ad esaminare il conte-             7           86     STX $00       Memorizzo X in 0000 per esaminarlo
nuto delle locazioni di memoria 017F e                8           00
0180 troveremo nella prima il valore 05               9           4C     JMP Monitor
(PC parte bassa) e nella seconda 0,                    A          22
(PC parte alta) (vedi Fig. 43).                        B          FE
   Vogliamo farvi notare infine che que-               Eseguendo questo programma si troverà 38 (valore attuale dello S)
sta non è una vera subroutine (infatti              nella locazione di memoria 0000; se si va ad esaminare la 0139, si
non ne usciamo con una istruzione RTS!)             troverà il 7B che vi abbiamo caricato. Tenete comunque presente che, ·
ma solo un esempio dimostrativo di come             quando si torna al Monitor lo S viene ancora modificato dal program-
avviene il salvataggio nello Stack.                 ma di monitor stesso e viene riportato al valore originario.
    Esaminiamo ora altre quattro istruzio-
ni molto importanti relative allo Stack.
   PHA (Push Accumulator). Codice ope-
rativo 48.                                                                                 Istruzioni di Shift e Rotazione
    Con questa istruzione il contenuto
dell'acoumulatore viene salvato nella lo-
cazione di memoria puntata dallo Stack
Pointer quindi S viene decrementato                                                           Tratteremo ora una classe di istruzioni
 (vedi Fig. 44).                                                                           che di primo acchito può sembrare oscu-
    Quindi se S = 39 (cioè punta alla loca-                                                ra, ma che all'uso pratico si rivela di
zione 0139 pagina 1) e ACC = 7B                                                            grande utilità, come avremo modo di
dopo l'esecuzione di PHA si ha:                                                            vedere nel corso di questo stesso articolo.
                                                                                           Si tratta delle istruzioni di SHIFT e RO-
S = 38. ACC = 7B                                                                           TAZIONE.
                                                                                              Sono quattro istruzioni:
e il contenuto della locazione di memoria                                                     ASL (Aritmetic Shift Left) Shift (spo-
0139 è= 7B.                                                                                stamento) a sinistra aritmetico.

                                                                                                                                   69
```

## Pagina PDF 70

```text
   LSR (Logical Shift Right) Shift a destra          Per una perfetta comprensione del               In effetti si esegue uno Shift a sinistra
logico.                                           modo di agire di queste istruzioni si veda      di un posto aggiungendo uno zero alla
   ROL (Rotate Left) Ruota a sinistra             la Figura 45.                                   fine del numero.
comprendendo il Carry.                               L'uso di queste istruzioni verrà chiari-        Per esempio:      739 x 10 =

                                                                                                                    lf~-0
    ROR (Rotate Right) Ruota a destra            to man mano che si procede nella trat-
comprendendo il Carry.                           tazione; diamo di seguito solo un esem-
   I codici operativi delle varie istruzioni     pio. Vi siete mai chiesti come si fa a             La stessa cosa avviene per i numeri
vanno ricercati sulla tabella riassuntiva        moltiplicare un numero per 10 nel nostro         binari. Moltiplicare per 2 (che è la base
delle istruzioni del 6502.                       solito sistema decimale?                         della numerazione binaria. come 10 Io

                                                                            Istruzione

                                                                            ~
                                                                            ~                  esempio

                   Locazione di memoria o Accumulatore                                    0e                                prima di ASL




                                                                                                                            dopo ASL
                                                                                          e
                                                                                                          ACC



                                                                            Istruzione


                                                          EJe
                                                                            El                 esempio

            Locazione di memoria o Accumulatore                                                                     0e      prima di LSR




                                                                                                                            dopo LSR
                                                                                                                      e
                                                                                                   ACC




                                                                             Istruzione




                                                       Carry
                                                                             litd               esempio

             Locazione di memoria o ACC                                                                                      prima di ROL




                                                                                                                             dopo ROL




     IEJI·~
                                                                             Istruzione




        e
                                                                             Et                 esempio

                                                                                                                              prima di ROR
                         Locazione di memoria o ACt




                                                                                                                              dopo ROR




              Fig. 45 - Rappresentazione grafica de/funzionamento delle istruzioni ASL, LSR. ROL e ROR. Movimenti eseguiti sui bit.

70
```

## Pagina PDF 71

```text
        X
                         10 ADDENDO           ( L)
                                                                L= Low = parte bassa                 La moltiplicazione
       X+1               10 ADDENDO           (H)               H:High:parte alta

                                                                esempio:                                Passiamo ora ad un'operazione mate-
       X+2                20 ADDENDO          (L)                                                    matica più seria, il prodotto di due nu-
                                                                         13 9 F                      meri binari da 8 bit, che dà come risul-
                         20 ADDENDO                                                                  tato un numero binario di 16 bit
       X+ 3                                   (H)                         H   L                         Per capire quest'ultima affermazione
                                                                                                     facciamo un semplice esempio con i
                                                                                                     numeri decimali. Se si moltiplicano due
                                                                                                     numeri decimali da 2 cifre ciascuno si
                                                                                                     ottiene un numero decimale da 4 cifre.
Fig 46 - Lo schema rapprrsr.>nw come sono asse!{1zate quattro successive locazioni di memoria           Infatti il prodotto più grande che si
                per esefiuire una somma di due numeri da 16 bit ciascuno.                            può fare con due numeri da due cifre è:
                                                                                                     99 x 99 = 9801, che è un numero da
                                                                                                     4 cifre.
è per quella decimale) un numero binario
equivale ad eseguire uno Shift a sinistra
di un posto, introducendo uno 0 in coda
(ASL).
   Dividerlo per 2 equivale ad uno Shift
a destra, introducendo uno 0 all'inizio
(LSR).
   Eseguiamo per esempio 3B x 2 = 76
prelevando il dato dalla locazione di me-
moria 0001.

  Scriviamo il semplice programma:
0200          A5    LD A $00
                                                        1            RISULTATO       =I
   1         00
   2         0A     ASL A*

  *Si vuole spostare a sinistra il conte-
nuto dell'Accumulatore.                                                                         NO
                                                        2
   3           85      STA $01                                                                                 BMS   =Bit meno significativo
   4           01                                                                                              MPC   = Moltiplicatore
   5
   6
               4C
               22
                       JMP Monitor                                                                             MPD   =Motiplicando
   7           FE
                                                                       RISULTATO :
   Partiamo introducendo 3B nella loca-
                                                        3
                                                                      RISULTATO + MPD
zione 0000, eseguiamo il programma e
troviamo 76 nella 0001. La 0000 rimane
invariata.
   E per moltiplicare un numero N per
5? Si potrà fare:
N X 5 = (N X 2) X 2 + N                                 4            SHIFT A SINISTRA
   Perciò per eseguire 0C x 5 ~ 3C, con                                  DI MPD
il moltiplicando in 0000 e il risultato po-
sto ancora in 0000, si scrive il programma:
0200           A5      LDA $00
    1          00
    2          0A      ASLA                             5       NO
    3          0A      ASLA
    4          18      CLC Pulisco il Carry
    5          D8       CLD Lavoro in
                       esadecimale
    6          65      ADC $00
    7          00
    8          85      STA $00                                                FINE
    9          00
    A          4C      JMP Monitor
    B          22
   C           FE
   Notiamo che tutte queste operazioni
di prodotto sono binarie (si lavora in esa-
decimale) e che presuppongono che il
risultato rimanga nell'ambito degli 8 bit.               Fig 47 - DiaKramma di.flusso del provamma per esef;uire una moltiolicazione.


                                                                                                                                               71
```

## Pagina PDF 72

```text
   La stessa cosa avviene per i numeri                                                           Per provare la nostra subroutine scri-
esadecimali.                                                                                  viamo ora il programma che segue:
   Per eseguire l'operazione di prodotto                                                      02000          A2
cominciamo col costruire una routine
che somma due numeri da 16 bit, opera-                                                        LDX = 00 Lavoriamo con le prime 4 lo-
zione binaria.                                                                                cazioni di RAM
   Supponiamo che i due numeri siano
posizionati in pagina 0 secondo la tabella                                                    a eseguire la subroutine
di Fig. 46.
   Il registro X è posizionato sul primo                                                         Per provare la nostra subroutine scri-
numero, ovvero X contiene l'indirizzo                                                         viamo ora il programma che segue:
della locazione di memoria che contiene
 la parte bassa (meno significativa) del 1°                                                   0200         A2     L DX 1f ()() Lavo-
 addendo (1° ADDENDO L).                                                                      riamo con le prime 4 locazioni di RAM
   Il risultato della somma va messo al
posto del secondo addendo, cioè sosti-                                                           1             00
tuisce il valore del secondo addendo.                                                            2             20 JSR 0300 Andiamo
   Scriviamo ora un programma che uti-                                                           3             00 a eseguire la subroutine
lizzeremo come subroutine e che potrete                                                          4             03
conservare nella vostra biblioteca mate-                                                         5             4C JMP Monitor
matica.                                                                                             6          22
0200            18     CLC           Carry = 0                                                      7          FE
     1          D8     CLD            Funzionamento esadecimale
    2           B5     LDA0,X         Carico in ACC il 1° ADDENDO L                              Mettiamo i dati da sommare alle loca-
    3           00                                                                            zioni di memoria:
    4           75     ADC 2,X        Gli sommo il 2° ADDENDO L                               0000 1° addendo parte bassa
    5           02                                                                            0001 1° addendo parte alta


                                   l
    6           95     STA2,X        Metto la parte bassa (L) del risultato nella locazione   0002 2° addendo parte bassa
    7           02                   del 2° ADDENDO                                           0003 2° addendo parte alta
    8           B5     LDA l ,X       Si ripetono le stesse operazioni per la parte alta.
    9           01                   Notiamo l'assenza della operazione CLC                     Il risultato compare nelle:
    A           75     ADC 3,X                                                                0002 somma parte bassa
     B          03                                                                            0003 somma parte alta
    c           95     STA 3,X        Risultato H a posto
    D           03                                                                              Verificate che:
    E           60     RTS           Ritorno dalla subroutine                                 0013 + 0013                0026
   Con questo programma abbiamo mes-                                                          3214 + 1F6A                517E
so il Carry = 0, poi sommato le parti basse                                                   A999 + 0001                A99A
degli addendi, quindi, tenendo conto del
Carry, abbiamo sommato le parti alte                                                             Facciamo notare che con questo pro-
degli addendi.                                                                                gramma la somma più grande che si può
   Allo stesso modo a scuola ci hanno                                                         eseguire è FFFF + FFFF = FFFE con
insegnato che:                                                                                Carry = 1; cioè abbiamo oltrepassato il
                                                                                              limite dei 16 bit perché abbiamo un ripor-
           27 84 +                                                                            to (Carry) diverso da 0. Dal punto di
           15 52 =                                                                            vista generale è importante andare a con-
riporto     1                                                                                 trollare il Carry per vedere se c'è un
           43 36                                                                              riporto; nel caso specifico del prodotto,
                                                                                              come v..edremo, ciò non avverrà perché
                                                                                              in effetti sommiamo un numero da 16
                                                                                              bit con uno da 8 bit.
                      0000                                      Moltiplicatore                  Affrontiamo ora il problema del pro-
                       0001
                       0002            JI       ~
                                                             l  Moltiplicando
                                                                                              dotto.

                                                                                                Vediamo prima come si esegue una
                                                                                              moltiplica sulla carta quando usiamo nu-
                                                                                              meri nel sistema decimale.
                       0003
                                                                Risultato                      57 X
                       0004                                                                    14 =
                                  ,,
                                                                                              m- 1° passo si fa 57 x 4
                                                                                              570     passo si fa 57 x 1 e il risultato
                                                                                                        2°
                                                                                              m- 3°lo sipasso
                                                                                                          moltiplica x I 0 (Shift a sinistra)
                                                                                                              si sommano
                                                                                                        i due risultati parziali

                                                                                                 La stessa cosa viene fatta in codice
                                        - - -       - - -                                     binario, tenendo conto che qui si molti-
                                                                                              plica 0 x 0 o per I; moltiplichiamo
      Fig. 48 - Locazioni di memoria usate nel programma per eseguire la moltiplicazione.     CD x8D.

72
```

## Pagina PDF 73

```text
(CD)              11001101   X                                                              ria perché, come abbiamo detto, ad ogni
(8D)              10001101                                                                  loop il moltiplicando cresce di un bit.
                  11001101            Sono 8 righe in cui si ha 0 nel posto in cui il          Per provare questo programma verifi-
              00000000                moltiplicatore aveva 0, altrimenti si ha il molti-    chiamo l'esattezza della seguente mol-
            11001101                  plicando moltiplicato ogni volta per 2 (cioè spo-     tiplicazione: CD x 8D = 70E9.
           11001101                   stato ogni volta di una posizione)                       Per fare ciò, riferendoci alla fig. 8 inse-
          00000000                                                                          riremo 8D alla locazione f)f)f)f), CD alla
         00000000                                                                           OOf)l e troveremo la parte bassa del risul-
        00000000                                                                            tato alla locazione f)f)()3, la parte alta del
       11001101                                                                             risultato alla locazione 00()4.
(70E9) 111000011101001                                                                         Verifichiamo ora l'esattezza di queste
                                      Risultato = somma di tutti i parziali                 altre moltiplicazioni:
                  15 bit
                                                                                            A9 X BI = 7409
   Facciamo ora un programma che ese-                                                       f)2X l):t = 0008
gue queste operazioni. Notiamo ancora                                                       lf)X lf) = ()100
una cosa, che basta continuamente "shift-         Facciamo subito qualche commento          34 X 97 = IEAC
are" a sinistra il moltiplicando e sommarlo    chiarificatore.                              12 X 13 = 0156
ad un risultato (che all'inizio abbiamo           Abbiamo messo a zero la locazione
posto = 0) solo se il bit corrispondente       di memoria 0002 (istruzione alla 0200)          E con questo abbiamo terminato que-
del moltiplicatore è = 1. Vediamo il flow      per permetterci di eseguire lo shift del     sto altro important~ blocco di software;
chart alla Fig. 47.                            moltiplicando verso sinistra: infatti il     nel prossimo capitolo esamineremo an-
   Commentiamolo: blocco 1 - pongo il          moltiplicando che era inizialmente un        che alcuni importanti aspetti dell'hard-
risultato uguale a 0; blocco 2 - mi chiedo     numero di 8 bit alla fine, dopo la mol-      ware che ci consentiranno di utilizzare
se il bit meno significativo del moltipli-     tiplicazione x 2, diventa un numero da       la "porta utente" parallela da 8 bit pre-
catore BMS (MPC) è = 1 (cioè eseguo            15 bit come mostrato nell'esempio della      sente sull'AMICO 2000A.
uno shift del moltiplicatore a destra di       moltiplicazione binaria.                        Sempre nell'ambito dell'hardware vi
una posizione portando il bit meno signi-      Nell'istruzione LSR FF ,X all'indirizzo      daremo tu'tte le informazioni necessarie
ficativo nel Carry, quindi eseguo una          lJ2 f)A) facciamo notare che FF + X = 00      per "manovrare" a vostro piacimento ogni
istruzione di salto condizionato dal bit       (essendo FF = -1 e X = I) è l'indirizzo      .singolo segmento delle cifre del display.
di Carry); blocco 3 - se si, sommo il          della locazione di memoria in pagina zero
moltiplicando al risultato, se no, passo       il cui contenuto viene spostato ("shifta-
direttamente al blocco 4; blocco 4 - ese-      to") di un bit a destra (nel Carry).
guo uno shift a sinistra di una posizione         Rimane infine da spiegare lo shift di
del moltiplicando; blocco 5 - mi chiedo        più byte. L'operazione di shift a sinistra
se tutto il moltiplicatore, dopo lo shift                                                   Un gioco:
                                               di due parole avviene con l'istruzione       ""la corsa dei cavalli"
del blocco 2, è arrivato ad essere uguale      ASL e ROL secondo quanto mostrato
a zero.                                        dalla fig. 9. Questa operazione è necessa-
   Prima di scrivere il programma ponia-                                                        Ora vi presentiamo un giochetto origi-
 moci nelle condizioni rioortate in Fig. 48.                                                nale che utilizza i tre segmenti paralleli di
                                                                                            ogni cifra come se fossero dei "cavalli" in
                                                                                            corsa. La probabilità di vincere che ha o-
0200       A2 LDX #01 Punto X sulla locazione 00f)l                                         gni cavallo è casuale e dipende in primo
   1       fH                                                                               luogo dallo stesso programma; il bello è
   2       A9 LDA#00                                                                        che si può intervenire direttamente ''fru-
   3       00                                                                               stando" ogni cavallo per farlo correre di
   4       95 STA l ,X Porto f) nella locazione 0002                                        più. Attenzione però, se fo si frusta troppo
    5       f)l                                                                             (e anche questo non è prevedibile a priori
    6       95     STA 2,X                                                                  in quanto deciso casualmente dal pro-
    7       02                   Azzeramento del risultato                                  gramma) potrebbe come si dice in gergo
    8       95     STA 3,X                                                                  "rompere" e attardarsi nella corsa invece
    9       03                                                                              di accelerare, andateci piano allora.
   A loop 56       LSR FF ,X Porto il bit meno signif. del moltiplicatore nel Carry             Il programma viene dato come al solito
   B        FF                                                                              nel codice oggetto e parte dalla locazione
020C        9f)    BCC NOSOM Se è= 0 (Carry = 0) non faccio la somma                        ()iptJ. Si può giocare in tre; la frusta è
   D        03                                                                              rappresentata dai tastt
   E        2f>    JSR 03f)f) Eseguo la somma tramite la subroutine                         [[]per il cavallo in alto, ~ per quello di
   F        00
02Jt')      03
    1 Nosom 16
    2
    3
            00
            36
                   ASL 0,X
                   ROL l,X
                             l   Eseguo lo shift del moltiplicando
                                                                                            mezzo e ra per quello in basso. Pigiando
                                                                                            ripetutamente ognuno di questi tasti dopo
                                                                                            aver fatto partire il programma (e quindi
                                                                                            la corsa) si accelera l'andatura del rispet-
    4       01                                                                              tivo cavallo. All'ultimo giro si accende
    5       BS     LDA FF,X Vedo se ho il moltiplicatore = f)                               un "l" sull'ultimo display a destra che
    6       FF                                                                              rappresenta la barriera di arrivo, la corsa
    7       D0     BNE Loop Se no continuo il Loop                                          si ferma quando il primo cavallo tocca
    8       Fl                                                                              questa barriera.
    9       4C     JMP Monitor                                                                 Per ripartire bisogna premere il tasto
   A        22                                                                              RES e riportarsi alla locazione di par-
   B        FE                                                                              tenza f>200.

                                                                                                                                       73
```

## Pagina PDF 74

```text
           Carry
                                                                                     1aparola
                                                                                     ASL



  Perso-




Fig. 49 - Combinazioni dell'uso delle due istruzioni ASL e ROL per riempire in modo automatico
due successive locazioni di memoria con il risultato della moltiplicazione che cresce di un bit
ad ogni loop. Si noti che il bit che esce a sinistra e va nel Carry (nella istruzione di ROU viene
           perso perchè subito dopo sostituito con quello proveniente da/l'istruzione ASL.




  Programma della .. Corsa dei ca,·alli"



  0200 =08 A2 13 80 D9 02 95 7C CA 10 F8 A9 89 80 D3 FD
  0210 =A2 09 AD 00 89 7C 00 84 FC 20 38 FF C8 CO D6 90
  0220 ==F3 20 EB FE A5 8F 3D E3 A2 03 CA 30 DE 06 86 DO
  0230 =F9 86 99 A4 99 86 83 89 ED 02 35 7C 95 7C E8 96
  0240 =83 89 ED 02 49 FF 15 7C 95 7C ED 05 30 28 DO 06
  0250 =A5 8F FO 18 DO 23 A2 D2 38 85 83 E9 06 95 83 CA
  0260 =10 F6 A2 06 B5 7C 95 76 A9 80 95 7C CA DO F5 C6
  0270 =8F DO 06 1,5 81 09 06 85 8·1 89 89 OD FO OA 20 es
  0280 =02 29 3C DO 1A 99 89 DO 20 C5 02 29 38 85 9A 89
  0290 =8C 00 30 08 29 38 C5 9A BO 05 A9 FF 99 89 00 20
  02AO =EB FE AO FF A6 99 30 FO 02 FO 0·1 88 98 55 89 85
  0280 =9A 20 ç5 02 38 29 01 65 9A 18 A6 99 75 8C 95 BC
  02CO =95 86 4C 21\ 02 38 A5 92 65 95 65-96 85 91 A2 04
  02DO =85 91 95 92 CA 10 F9 60 00 80 80 80 80 80 80 80
  02EO =FF FF FF 80 80 80 00 00 00 80 80 80 08 FE BF F7
  02FO =01 02 04




             SOLUZIONE DEGLI ESERCIZI DEL SESTO CAPITOLO.                                            ) In questo programma si ha:
  1° Eserc. izio. La soluzione di questo problema viene data nel testo di questo stesso articolo.
  2° Esercizio. Questa la soluzione al problema utilizzando le istruzioni note fino alla
                                                                                                     I   Il 1° numero da moltiplicare nella locazione
                                                                                                         9999.
                                                                                                         Il 2° numero da moltiplicare nella locazione
     volta scorsa:                                                                                       9991.
                                                                                                         Il risultato nella locazione 9992.
 8288         A9 LDA #99           Azzeramento del risultato
   . 1                                                                                                   I numeri trattati da questo programma sono in
              B8                                                                                         esadecimale: i numeri che si possono moltipli-
     2        D8 CLD                                                                                     care sono quelli il cui prodotto è minore o
     3        A6 LDX $99           Il moltiplicando va nel registro indice X
                                                                                                         opale a 255.                                ·
     4        B8                                                                                         3 Esercizio. Di se211ito una delle soluzioni
     5        FV    BEQ Fine
            86                                                                                           possibili:    9299         A2 LDX #89
     6
     7 Loop 18 CLC                                                                                                      1        89
     8      65 ADC $91              Sommo il moltiplicatore ad ogni loop                                                2 Loop 8A TXA
     9      81                                                                                                          3      95 STA 98,X
     A        CA DEX                                                                                                    4        99
     B        pe BNE Loop           Faccio un numero di loop pari al moltiplicando                                      5        F.8 INX
     e        FA                                                                                                        6        E9 CPX #$51
     D Fine 85 STA $92              Risultato a posto                                                                   7        51
     E        '12                                                                                                       8        D9 BNE Lollp
     F        4C JMP Minitor                                                                                            9        F8
  B2UJ        22                                                                                                        A        4C JMP Monitor
     1        FE                                                                                                        B        22
                                                                                                                        C        FE


74
```

## Pagina PDF 75

```text
                                                         CAPITOLO VIII




                                 USO DELLA PORTA UTENTE




n     ell'AMICO 2000A c'è un integrato
      che gestisce le operazioni di input
      e output: si tratta del dispositivo
8255 il cui schema appare in Fig. 1.
   Questo integrato dispone di tre porte
                                               per Low = basso) ovvero i bit 3, 2,.1, 0
                                               come mostra la Fig. 51.
                                                  Queste due parti oella porta c hanno
                                               la particolarità di poter funzionare una
                                               in uscita e una in entrata (indifferente-
                                                                                                 2) Scrivo (se la pòrta C è stata posta
                                                                                              in Output) o leggo (se la porta C è stata
                                                                                              posta in input) il dato nella locazione
                                                                                              FD02 (che è appunto l'indirizzo relativo
                                                                                              alla porta C).
ovvero di tre mezzi per comunicare col         mente CH o CL) oppure tutte e due in              È possibile usare la porta C indiriz-
mondo esterno costituiti da 8 bit ciascuno     uscita o in entrata; questo naturalmente       zando urto per uno, ovvero singolar-
Di queste tre porte A, B e C, le prime         dipende da ciò che abbiamo program-            mente, i bit della porta utente. Per far
due sono utilizzate per la gestione del        màto cioè da cosa viene scritto nel re-        questo ci si serve soltanto del registro
display e della tastiera e sono controllate    gistro che definisce il modo di funzio-        di definizione (non della locazione re-
dal programma di monitor, la c invece          namento.                                       lativa alla porta C) e si procede come
è detta "PORTA UTENTE" perché uti-                Detto questo vediamo subito che scri-       segue.
lizzabile a nostro piacimento. Si tratta       vere una parola nel registro di defini-           Prima di tutto si definisce il modo di
solo di sapere come.                           zione del modo di funzionamento, ovve-         funzionamento delle varie porte scri-
                                               ro all'indirizzo FD03, non significa altro     vendo ima opportuna parola nella loca-
   Ognuna di queste tre porte ha un            se non determinare la funzione delle           zione FD03.
indirizzo della locazione di memoria           varie porte e cioé se la CPU in queste            Poi e questa è una particolarità dell'in-
nella quale il monitor (per . la A e B)        porte deve leggere un dato che le viene        tegrato 8255, scrivo ancora nella loca-
o l'utilizzatore (per la C) scrive una ben     presentato (condizione della porta di          zione FD03 una configurazione (una
determinata parola (ovvero 8 bit) che          input) o se essa stessa deve presentare        parola) tale da permettermi l'operazione
fa funzionare queste porte in un altret-       un dato sulle porte (condizione di output).    desiderata secondo la tabella che segue
tanto ben determinato modo; vediamo              La Fig. 52 rappresenta il registro del       e con riferimento alla fig. 54.
quali sono gli indirizzi di memoria inte-      modo di funzionamento; notiamo che i              B7 = l/J con ciò sele7.iono a_uesto par-
ressati dall'8255:                             bit sulle posizioni 2, 5, 6 e 7 sono "fissi"   ticolare modo di funzionamento che mi
                                               ovvero sono stati scritti così dal nostro      permette di usare la stessa locazione
 Indirizzo della Porta A = FD00                progr.amma di monitor perché 1'8255 po-        FD03.
 Indirizzo della Porta B = FD01                tesse lavorare nel progetto dell' AMICO
 Indirizzo della PORTA C (PORTA                                                                  B6 - B5 - B4 = 0 o 1 è indifferente
                                               2000A in un certo modo.                        nulla cambia.
UTENTE) = FD02

    La porta utente dell'8255 può essere
utilizzata previa programmazione del              Vediamo come usare (programmare)
modo di funzionamento: per far ciò esi-        gli altri bit:
 ste un registro di definizione del modo di    B4 corrisponde alla porta .(\: si scrive 0 in Output e 1 in Input
funzionamento che nel nostro caso ha           BI corrisponde alla porta B: si scrive 0 in Output e 1 in Input
 indirizzo FD03.                               B3 corrisponde alla porta CH: si scrive 0 in Output e 1 in Input
   Fisicamente la pòrta utente C sono          B0 corrisponde alla porta CL: si scrive 0 in Output e l in Input
nell' AMICO 2000A quegli otto capicorda          Come esempio nella Fig. 53 sono ri-
posti in alto e in mezzo nena piastra sui      portate le configurazioni utilizzate dal
quali sono presenti quegli otto bit paral-     monitor che sono:
leli (nel senso che si leggono o si scri-            89 per eseguire la routine del display
vono allo stesso tempo) di cui abbiamo               99 per eseguire la routine della ta-
parlato.                                             stiera.
                                                  Per lavorare con la porta C si dovrà
   Prima di passare ad esaminare come          agire allora nel seguente modo:
si usa il registro di definizione premet-         1) Decido come usare la porta C scri-
tiamo che la porta c è divisa in due parti:    vendo una parola di definizione alla lo-
la porta CH (H sta per High = alto)            cazione FD03 (decido cioé se utilizzarla
ovvero i bit 7, 6, 5, 4 e la porta CL (L sta   come uscita o ingresso dati);

                                                                                                                                       75
```

## Pagina PDF 76

```text
                    CONFIGURAZIONE
                    PIEDINI          8255A


                                               40    J PA4
             PA2
             PA1
                                               39 ] PA5
                                               38    J PA 6                                                                                        1/0
             PAO    4                          37     PA 7                                                                                          PA 7-PAo
              RD    5                         36       WR
              es                              35       RE SET
          GNO
              A1
                    7
                    8
                                              34
                                              33
                                                                         Bus '<fàti .                                                              1/0
                                                                         bidirezionale                                                             PC7-PC 4
              AO                              32
             PC7
                                                                         D7·Do
                    10                        31
                                                                                                                                                   ~/o
                                                       03
             PC6[   11
                           8225A              30       04
             PC5    12                        29                                                                                                   PCrPCo
                    13                        28       D5
                    14                        27       07                      mi
             PC1    15                        26       Vcc
                                                                              Wff                                                                  I/o
                                                                                 A1
             PC2    16                        25       PB7
                                                                                 Aò                                                                PB 7-Pe 0
                    17                        24 ì     PB6                  RESET ·
             PBO    18                        23       PBS
             P B1   19                        22       PB4
                                                                                -"'-
             P B2   20                        21       PB3                      es

                FUNZIONE DEI PIEDINI
                                                                  A = Controllo gruppo A; B = Controllo gruppo B; C = Logica di controllo lettura-scrittura;
        Dr Do            Bus dati bidirezionale                   D = Buffer dati; E = Porta A (8 bit); F = Porta CH (parte alta 4 bit); G = Porta CL (parte
                                                                  bassa 4 bit); H = Porta B (8 bit).
        RESET            Ingresso di azzeramento
        --
        es               Selezione
        -
                                                                                          Fig. 50 - Schema a blocchi dell'integrato 8255A.
        RD               Ingresso impulso di lettura
        ---
        WR               Ingresso impulso di scrittura

        AO,A1            Indirizzi   cl elle porte

        PA7 ·PAO         Linee di uscita della Porla          A

        PB7-PBO          Linee di uscita della Porta          B     Ora scriverò nella stessa locazione                 Da notare che in questo programma
        PC7-PCO          Linee di uscita della Porta          e   FD03, secondo quanto abbiamo spiegato              non si effettua alcuna operazione di
                                                                  poc'anzi, prima una parola che metta               "store" all'indirizzo della porta C (FD02),
                                                                  a 1 il bit 6, poi (e qui il tempo di durata        infatti in questo modo di funzionamento,
                                                                  dell'impulso dipende dal tempo di ese-             come abbiamo detto, si opera esclusi-
B3 - B2 - BI = 000 = Uscita sul bit 0                             cuzione della istruzione) una parola che           vamente con il registro di definizione
                 001 = Uscita sul bit 1                           metta a 0 lo stesso bit.6 della porta C: si        del modo di funzionamento alla loca-
                 010 = Uscita sul bit 2                           faccia riferimento alla Fig. 56.                   zione FD03.
                 011 = Uscita sul bit 3                             Compreso tutto ciò posso scrivere il                Con questo programma si ottiene un
                 100 = Uscita sul bit 4                           programma come segue:                              impulso di circa 10 µS (cioé il tempo di
                 101 = Uscita sul bit 5
                 110 = Uscita sul bit 6
                 111 = Uscita sul bit 7
   Selezione del bit della porta C
   su cui si intende operare.                                     0200             A9    LDA *$81
                                                                     1             81
                                                                     2             8D    STA $FD03             Definizione del modo di funzionamento
     B0 = 1 se si vuole scrivere un 1 sul                            3             03
  bit scelto.                                                        4             FD
     B0 = 0 se si vuole scrivere uno 0 sul
  bit scelto.                                                        5             A9    LDA #$0D
     Facciamo, per passare alla pratica, il                          6             0D
  seguente esempio. Si voglia realizzare                             7             8D    STA $FD03             Metto a 1 il bit 6 (Set del bit 6)
  un programma che generi un impulso                                 8             03
  al bit 6 della porta C.                                            9             FD
     Innanzitutto programmeremo il modo                              A             A9    LDA =\j.$0C
  di funzionamento in maniera che la porta                           B             0C
  CH (perché il 6° bit è in questa parte della                       c             8D    STA $FD03             Metto a 0 il bit 6 (Clear del bit 6)
  porta C) si trovi in condizione di Output.                        D              03
  Scriveremo allora, ad esempio il dato 81                           E             FD
  nella locazione di memoria FD03 po-                                F             4C    JMP Monitor
  nendoci nelle condizioni illustrate dalla                       0210             22
  Fig. 55.                                                           1             FE

   76
```

## Pagina PDF 77

```text
              .PORTA CH                   tt             PORTA CL
                                                                               t
                                                                                               ad eseguire le istruzioni DEX e BNE
                                                                                               (4µS in totale) moltiplicato per il numero
                                                                                               dei loop (256); allora 4 x 256 = 1,024 mS,
                                                                                               cioè una frequenza di circa 500 Hz.

              I 71 61 s I 41 I 21 e, I -1
                8       8         8        8        83       8                8                   Si può naturalmente diminuire il tem-
                                                                                               po di ciclo caricando un valore minore
                                                                                               da decrementare o aumentarlo serven-
                                                                                               dosi di due loop concatenati che fanno
                             Locazione           FD-2                                          uso dei due registri X e Y:
                                                                                                       LDY :ff $yy (yy = numero che
              Fig 51 - Con/ìg11ra::io11e della 11orta utente C al/'i11diri::::u FDfJ2.
                                                                                                       LDX #$00              determina il
                                                                                               Loop DEX                      ritardo)
                                                                                                       BNE Loop
                                                                                                       DEY
                                                                                                       BNE Loop
                                                                                                  Il ritardo generato da questa routine
                                                                                               è uguale a 1,024 msec moltiplicato per
                                Locazione FDéJ                                                 il numero caricato nel registro Y all'inizio
                                                                                               della routine; il tempo di ritardo massi-
                                                                                               mo è quindi di circa 262 millisecondi
                                                                                               (1,024 X 256).
                                                                                                   Facendo girare il programma appena
                                                                                               descritto sull' AMICO 2000A è possibile
                                                                                               vedere l'onda quadra generata se si è in
                                                                                               possesso di un oscilloscopio collegando
              Fìg. 52 - Loca:: ione FDfH del registro del modo di jim:::ionamento.             il probe al piedino 6 della porta utente.
                                                                                                   Se viene inserito un ritardo maggiore
                                                                                                nel programma possiamo osservare con
                                                                                                un semplice voltmetro (tester commutato
durata di esecuzione delle istruzioni) al       Note: 1) Dopo il primo decremento              sui 10 Vcc fondo scala) una tensione che
bit 6 della porta C ogni volta che facciamo il contenuto di X è = FF (infatti 0- 1 = -1 =      varia periodicamente fra il piedino 6 e
partire il programma.                       = FF); 2) Continuo a decrementare fino              massa.
   Se si desidera ottenere un tempo di      a che X = 0. Questo avviene dopo 256                   Una volta che si è in possesso delle
durata dell'impulso più lungo è neces-      decrementi. Durante. questo periodo di              tecniche per lavorare sulla porta utente,
sario inserire un loop di ritardo tra il    tempo il bit 6 è a 1; 3) Nota bene: entria-         non esistono più problemi a collegarsi
Set (portare a 1) e il Clear (portare a 0)  mo in questo Loop con X = 0 (risultato             all'esterno a qualsiasi altro dispositivo
del bit Se si vuole poi che l'impulso sia   del loop precedente).                               elettronico in grado di presentare alla
ripetitivo si utilizza l'istruzione di JMP;     La durata di ogni semionda si calcola           sua uscita livelli alti e bassi di tensione
vediamo di seguito il programma arric-      dal tempo impiegato dal microprocessore            o di saperli leggere.
chito di queste altre prestazioni:

                                                                                               Le Subroutine del monitor
0200           LDA #$81
   I           81                                                                                 Nel programma di Monitor, quello
   2           8D STA FD03                     Definizione       del   modo di funzionamento   che permette al microelaboratore di fun-
   3           03                                                                              zionare, sono impiegate alcune routine
   4           FD                                                                              che possono essere convenientemente
   5           A2 LDX #$00                     Preparo il loop di ritardo caricando 00 nel     utilizzate nei vostri programmi.
   6           00                              registro X                                         Vediamo ora quali sono e come si
   7 Onda      A9     LDA #S0D                                                                 usano.
   8           0D                                                                                 Routine di TASTO ATTIVO
   9           8D     STA F003                 Set del bit 6                                      Routine di IDENTIFICAZIONE DEL
  A            03                                                                              TASTO
   B           FD                                                                                 Routine I di RINFRESCO DISPLAY
                                                                                                  Routine 2 di RINFRESCO DISPLAY
   e Loop I    CA     DEX                      Decremento x<O
                                                                                                  A) Routine di tasto attivo - Ha come
   D           00     BNE Loopl                Salto al Loop 1 quando X =I= 0<2)
                                                                                               indirizzo di partenza la locazione FEEB.
   E           FD                                                                              Si esce dalla subrotine con 00 in Accu
   F           A9     LDA #S0C                                                                 mulatore se non vi è alcun tasto premuto
0210           0C                                                                              e con 01 in Accumulatore se c'é qualche
   I           8D     STA F003                 Clear del bit 6                                 tasto premuto.
   2           03                                                                                 Questa subroutine si usa per far suc-
   3           FD                                                                              cedere qualcosa quando si preme un
   4 Loop2     CA     DEX                      Ripeto la routine di ritardo(3)                 tasto qualunque. Alla fine di questa su-
    5          00     BNE Loop2                                                                broutine si fa un test sul contenuto dell'
    6          FD                                                                              accumulatore utilizzando una istruzione
    7          4C     JMP Onda                 Ritorno all'inizio del set bit 6 per generare   di BEQ o BNE.
    8          07                              un'onda quadra continua                            Normalmente però è più utilizzata la
    9          02                                                                              routine che segue, di identificazione del

                                                                                                                                        77
```

## Pagina PDF 78

```text
                                                                                                       tasto, perché permette di assegnare ad
                       l..ocazione                                                                     ogni tasto una determinata funzione da
                                                                                                       eseguire.

                                                                I                                         B) Routine di identificazione del tasto -
                                                                                                       Ha come indirizzo di partenza la loca-


                                                     l2             .PP0 RR:fTAA·
                                                                      0
                                                                                    CL< ~   Input
                                                                                    B =Output
                                                                                                       zione FF57. Prima di entrare in 'questa
                                                                                                       routine è bene inizializzare l'integrato
                                                                                                       8255 per essere certi che esso sia in grado
                                                                                                       di trattare i segnali così come la routine
                                                                                                       di identificazione del tasto richiede: per
                                                                                                       far questo basta caricare il numero 99 nel
                                      - - - - - - - - - PORTA CH = input                               registro di definizione del modo di fun-
                                                                                                       zionamento .
                               .____ _ _ _ _ _ _ _ _ PORTA A                           = Output           Si possono usare le seguenti istruzioni:
                                                                                                       A9      LDA        #$99
                                                                                                       99
                       Locazione FD~J                                                                  8D      STA        $ FD03
                                                                                                       03
99
      I I• I' I I I, I -I I
     = 1                      1       1                     1
                                                                                                       FD
                                                                                                          Si esce dalla routine con il valore del
                                                                                                       tasto contenuto in Accumulatore secon-
                                                     ~ PORTA CL = Input                                do quanto riportato nella Tabella 17. Nella
                                                                                                       tabella sono riportate due serie di valori
                                                                                                       diversi per ogni tasto che dipendono dal
                                                                     PORTA B            = Output       modo di funzionamento in cui è stato
                                                                                                       posto il processor: decimale (mediante
                                                                     PORTA CH = Input                  l'istruzione SED) o esadecimale (median-
                               .____ _ _ _ _ _ _ _ _ PORTA A                            = Input        te l'istruzione CLD). Se non vi è alcun
                                                                                                       tasto premuto o più di un tasto premuto
                                                                                                       il contenuto dell'accumulatore vale 21
                                                                                                       se in funzionamento decimale o 15 se
                                                                                                       in funzionamento esadecimale. Per usare
Fig. 53 - Due configurazioni del registro del modo di .fùnzionamento utilizzate dal programma          questa routine si fa una comparazione
             di monitor per eseguire la routine del display e quella della tastiera.                   in uscita con il numero corrispondente
                                                                                                       al tasto che interessa seguita da una
                                                                                                       istruzione di Branch.
                                                                                                           C) Routine 1 rinfresco display - Ha
                                                                                                       come indirizzo di partenza la locazione
                                                                                                       FF06.
                                                                                                           Durante l'esecuzione la routine prele-
                                                                                                       va il contenuto esadecimale della loca-
                                                                                                       zione di memoria indirizzata dalle loca-



                                                                                                       Fig. 55 - Programmazione del modo di funzio-
                                                                                                       namento per porre la porta CH in condizione
          Fig. 54 - Uso del registro del modo di funzionamento per usare la porta C                    di Output.
                              indirizzando i suoi bit uno per uno.




                                               Locazione F0 • .3 ·

                  81     ~ __~ . -__,___--'-I
                       =I.._    1
                            1.....         _ ·-- ..__I
                                          .......
                                          ·1      _ •__._
                                                       · I_.__; _                             I    Programmazione
                                                                                     ..L.---..11 = modo
                                                                                      ·I                 di funzionamento

                                                                                I· I ·. PORT~               CL. Input

                                                                                                    PORTA B     = OÙtput




78
```

## Pagina PDF 79

```text
                                         Locazione FD- 3

                                                               I   1
                                                                                              Parola per mettere a 1
                                                                                              il bit 6

                                                                                    L s.e ta1
                                                                   I-· - - - - - B i t 6




                 ; C=   If I I ' I' I1 11 I, If I ria~~~a6
                                 i-                                                       =             per mettere d


                                                                   ·1               L Clear a~
                                                                   --------Bit 6



                 Fig. 56 - Le due parole @D e IX: scritte alla locazione FD03 servono a portare a I o a g il bit 6 della pona C.


zioni di pagina base 00FA (parte bassa) Listing
e 00FB (parte alta). In altre parole il
contenuto delle locazioni 00F A e 00FB 0200                A9 LDA #=$02               Carico 02 nell'accumulatore
diventa l'indirizzo di una locazione di       1            02
cui si vuole vedere il contenuto.             2            85 STA $FA                 Memorizzo 02 alla locazione 00F A
   Per utilizzare convenientemente que-       3            FA
sta routine è evidente che è necessario       4            85 STA $FB                 Memorizzo 02 alla locazione 00FB
caricare in precedenza queste locazioni       5            FB
di memoria.                                   6            A9 LDA #S04                Carico 04 in ACC
   Per utilizzare in pratica questa routine   7            04
facciamo l'esempio di un programma            8            8D STA $0202               Memorizzo 04 nella locazione f)2f)2
che carica sul display indirizzi la loca-     9            02
zione 0202. È chiaro che sul display         A             02
apparirà il contenuto di memoria relativo     B            20 JSR FF06                Salto alla subroutine I di rinfresco del display
all'indirizzo 0202; vogliamo poi che que-     c            06
sto contenuto sia 04 (vedi Listing a lato).  D             FF
   Attenzione! A questo punto il pro-
gramma sembrerebbe terminato, ma se          Tabella 17 - Dati presenti in Accumulatore al ritorno della ubroutine di
si facesse partire l'esecuzione vedrem-      identificazione dei tasti' secondo il tasto premuto.          ·
mo un lampo di luce nel display e poi
più niente.
   Infatti per mantenere la configurazio-              TASTO             DAT0 1          TASTO         DAT0 2         DAT0 3
ne di cifre fissa sul display è necessario                 o                00         A                  10             A
"rinfrescare" continuamente il display                     1                01         B                  11             B
stesso: si completa perciò il programma                    2                02         e                  12             e
con una istruzione di JMP che fa ripetere                  3                03         D                  13             D
in continuazione la subroutine:                           ·4                04         E                  14             E
                                                         • 5                05         F                  15            ·F
020E             4C JMP 020B                               6                06         AD                 16             10
     F           0B                                        7                07         DA                 17             11
0210             02                                        8                08
                                                                            09
                                                                                       t
                                                                                       RUN
                                                                                                          18
                                                                                                          19
                                                                                                                         12
                                                                                                                         13
   Ora si può far partire il programma.                    9
                                                                                       REO                20             14
   Vediamo ora in particolare come fun-                                                NESSUN
ziona questa subroutine: viene prelevato                                              'TASTO              21             15
il contenuto delle locazioni di memoria
puntate da f)f)FA e f)f)FB che viene tra-
sportato nella locazione f)f)F9. Successi-         .1 = Funzionamento decimale e esadecimale
                                                    2
vamente il contenuto delle locazioni di               = Funzionamento decimale
                                                    3 =Funzionamento esadecimale
memoria f)f)F9, f)f)FA e f)f)FB viene tra-
 sferito sul display come mostra la Fig. 57.

                                                                                                                                     79
```

## Pagina PDF 80

```text
                                         DISPLAY




                              1,1 ,1.1 lt
                                    \
                                    \I
                                                                  \
                                                                  . ~
                                                                       \/
                                                                         I                                I
                                                                                                          I
                                                                                                           I
                                                                                                                           I
                                                                                                                               LtEJ
                                                                                                                               /
                                                                                                                                        '
                                                                                                                                                                 I
                                                                                                                                                                     I
                                                                                                                                                                         I


                                     '
                                     \
                                         \                         I
                                                                      ,,
                                                                       f\
                                                                            \
                                                                                                          ,,
                                                                                                          I
                                                                                                           1/
                                                                                                                       '
                                                                                                                                                        I
                                                                                                                                                            /I
                                         I                        I             \                         '                                         I
                                                                                                                                                                                          esempio di alfabeto che può e~sere vi-
                                          \                   I                     \              "                                            I                                         sualizzato dall' AMICO 2000A. E chiaro
                    Locazioni             \               l                             \/:                                                 /                                             che ognuno poi potrà scrivere i segni
                                              '• I   -I                                 11'

                                                                        ,,, ' ~
                                                                                                      I                                 I
                                                                                                      I                                                                                   più strani scrivendo delle parole oppor-
                                              11                                              \    I                       / h                                                            tune che mettano a 1 i bit corrispondenti

                                              i _,,,
                                                I                                                                      I           1,
                                                                                                                                                                                          segmenti che si vuole far accendere. Si
                                                                                                  ~            I
                                                                                                                   i                                                                      fa notare infine che il bit 7 non viene
                               I
                                                ,                                                     i
                                                                                                           I
                                                                                                                           ;;;
                                                                                                                                                                                          utilizzato.
                                                                                                                                                                                             Vediamo subito un programma esem-

                                   4 bit
                                              ~


                                                                                        4 bit
                                                                                                  -                                                                                       plificativo che presenti sul display:
                                                                                                                                                                                          -ASEL-.
                                                                                                                                                                                             Facciamo riferimento alla Tabella 2
                                               DATO 8 bit                                                                                                                                 e carichiamo i dati:
                                                                                                                                                                                          Locazione      Dato      Rappresentazione
                                                                                                                                                                                            008F          C0
Fig. 57- Corrispondenzafra contenuto delle locazioni in pagina base F9, FA e FB e le sei cifre del display.                                                                                 0090          F7               A
                                                                                                                                                                                               1         ED                s
                                                                                                                                                                                               2          F9               E
                                                                                                                                                                                               3          B8               L
   In questa stessa routine di rinfresco                                                          008F                                                  1a cifra a sinistra del display        4          C0
display si può entrare alla locazione                                                             0090                                                  23 cifra                             Scriviamo ora il seguente semplice
FFOC invece che alla FF06, saltando in                                                            0091                                                  33 cifra                          programma di uso generale c_he perm~tte
questo modo il prelevamento del dato                                                              0092                                                  4acifra                           di visualizzare ciò che abbiamo scntto
e la modifica del contenuto di f)f)F9. In                                                         (Jf)93                                                sa cifra                          nelle diverse locazioni:
questo modo possiamo visualizzare ciò                                                             0094                                                  63 cifra
che vogliamo direttamente sui sei digit                                                                                                                                                   0200           20 JSR FF7E
del display.                                                                                         Il caricamento di queste locazioni di
                                                                                                                                                                                                         Salto alla subroutine di
                                                                                                  memoria deve essere fatto tenendo conto
   D) Routine 2 di rinfresco display - Ha                                                         della corrispondenza esistente tra i sin-                                                              rinfresco
come indirizzo di partenza la locazione                                                           goli bit e . i segmenti delle cifre del di-                                                1           7E
FF7E.                                                                                                                                                                                        2           FF
                                                                                                  splay secondo quanto riportato nella
   Questa routine porta sul display il                                                                                                                                                       3           4C JMP 0200
                                                                                                  Fi.g. 58. Il bit a 1 corrisponde a segmento
contenuto delle sei successive locazioni                                                                                                                                                                 Eseguo in continuazione
                                                                                                  acceso.
di memoria così come segue:                                                                                                                                                                              la subroutine precedente
                                                                                                     Nella tabella 18 inoltre è riportato un
                                                                                                                                                                                             4           00
                                                                                                                                                                                             5           02



                                                                                                                                                                                            Tabella 18 - Esempio di alfabeto per
                     B~:a
                                                                                                                                                                                            display a sette segmenti e dati relativi
                                                                                                                                                                                            per generare quel carattere.




    B4·e~
                            /a,.b I I I I I I I I I
                        ~B2=c
                                                                                        g
                                                  .._B_7__B_5_.._B_5__._B_4_.._B_3_._B_2_•~
                                                                                                               f                        e                    d               e   b   a
                                                                                                                                                                                           Numeri
                                                                                                                                                                                           1 = 86
                                                                                                                                                                                                         Lettere
                                                                                                                                                                                                         A= F7            n = 54
                                                                                         0 -B-1_._B-~-                                                                                    2 = DB
                                                                                                                                                                                          3 = CF
                                                                                                                                                                                                         b = 7C
                                                                                                                                                                                                         C = B9
                                                                                                                                                                                                                          o= BF
                                                                                                                                                                                                                          P = F3
                                                                                                                                                                                          4 = E6         d =SE            q = 67
                                                                                                                                                                                          5 =ED          E= F9             r = 50
                                                                                                                                                                                          6 = FD          F = Fl          S =ED
                                                                                                                                                                                          7 = 87         G=BD             t = 78
                                                                                                                                                                                           8 = FF        H = F6          U =BE
                                                                                                                                                                                           9 = EF        I= 86           Y = EE
                                                                                                                                                                                           0= BF         J = 9E            Cifra
            Fig 58 - Corrispondenza fra i vari segmenti di og~i cifra e i bit della locazione                                                                                              - = C0        L = B8         Spenta = 99
                                   di m emoria ad essa relativa.


 80
```

## Pagina PDF 81

```text
                                                                                                                 Facendo partire questo programma il
                                                                                                             display rimarrà spento finché non si pre-
                        START                                                                                me il tasto 5, solo in questo caso si salta
                                                                                                             il Monitor che riprende il controllo del
                                                                                                             display facendolo accendere.
                AZZERO DISPLAY                                                                                   Ora esamineremo un programma più
          1          FLAG: 1
                                                                                                             complesso e completo che mette in evi-
                                                                                                             denza l'uso delle due routine di tasto
                                                                                                             attivo e di identificazione del tasto. Con
                                                                                                             questo programma vogliamo che il display
                                                                                                             mostri tutte le sue cifre a zero e che sul
                                                                                                             display compaia il valore dei tasti da
                     RINFRESCO                                                                               f) a F quando questi vengano premuti.
           2          DISPLAY                                                                                Prima di dare la lista delle istruzioni è
                                                                                                             opportuno esaminare il flow chart per
                                                                                                             meglio comprenderne la costruzione
                                                                                                             (Fig. 59).
                                                                                                                 Blocco 1: Si azzera il display e si pone
                                                                                                             un FLAG a 1. con questa operazione
                                           NO                                                                in pratica si memorizza il dato 01 in una
           3                                                                                                 certa locazione di memoria: lo scopo,
                                                                                                             come vediamo più avanti, è quello di
                                                                                                             controllare se in questa locazione di me-
                                                       5           FLAG:;                                    moria c'è 1 o 0, cioè se è stata modificata
                                                                                                             in qualche modo.
                                                                                                                 Blocco 2: Si salta alla routine di rin-
                                          SI                                                                 fresco del display.
            4                                                                                                    Blocco 3: Da questo blocco e fino al
                                                                                                             5 il programma che è stato scritto ha la
                                                                                                             funzione di permettere da una parte che
                                                                                                             l'uso del tasto RUN che fa partire il
                                                                                                             programma non venga identificato, (cioè
                                                                                                             nel pur brevissimo tempo durante il qua-
                   IDENTIFICAZIONE                                                                           le questo tasto rimane premuto il pro-
            6          TASTO                                                                                 gramma continua a rinfrescare il display
                                                                                                             azzerato), dall'altra che ogni tasto pre-
                                                                                                             muto venga identificato una sola volta
                                                                                                             come spieghiamo più avanti.
                                                                                                                 Quando allora entriamo nel blocco 3
                                                                                                             con il tasto RUN premuto alla domanda
                        DATO
            7                                                                                                "TASTO ATTIVO?" si esce con SI e
                     NEL DISPLAY                                                                             si entra nttl blocco 4.
                                                                                                                 Blocco 4: Qui ci si chiede se il FLAG
                                                                                                             è a 1: tutte le volte che passiamo al
                                                                                                             blocco 3 mentre RUN rimane premuto
                                                                                                             il FLAG sarà ancora a 1 in quanto niente
                                                                                                             lo ha modificato. In questo caso si esce
            8         FLA(;:1                                                                                dal SI e si torna alla routine di rinfresco
                                                                                                             del display che mostra ancora tutti zeri.
                                                                                                                 Blocco 5: Passando attraverso il bloc-
                                                                                                             co 3 dopo aver rilasciato il tasto RUN
                                                                                                             nessun tasto sarà attivo e quindi si usci-
                                                                                                             rà dal NO entrando nel blocco 5 clie
Fig. 59 - F/ow chart del programma per l'uso delle routine di identificazione del tasto e di tasto attivo.
                                                                                                              pone il FLAG a 0 e torna a rinfrescare
                                                                                                             il display.
                                                                                                                 A questo punto. posto il FLAG a 0,
                                                                                                             quando andiamo a premere uno dei tasti
   Vediamo ora un programma che mo-                                                                          della tastiera esadecimale entriamo nel
stri l'uso della routine di identificazione                                                                  blocco 3. usciamo con SI entrando nel
del tasto.                                                                                                   blocco 4 e da questo usciamo con NO
0200             F8 SED               Metto la macchina in modo decimale                                     entrando nel blocco successivo.
    1 Loop 20 JSR FF57                Salto alla routine di identificazione del tasto                            Blocco 6: Si entra nella routine di iden-
    2            57                                                                                          tificazione del tasto.
    3            FF                                                                                              Blocco 7: Il dato (cioè il valore dello
    4            C9 CMP # $f)5        Confronto il contenuto dell' ACC con 05                                stesso tasto) viene visualizzato nel display
    5            05                                                                                          e posto nella prima cifra a destra.
    6            D0 BNE Loop          Se non è uguale a 05 salto al Loop                                         Blocco 8: Il FLAG viene ripristinato
    7            F9                                                                                          a 1 per far in modo che il tasto identifi-
    8            4C JMP Monitor Se è uguale a 05 passo il controllo del micro al                             cato e che abbiamo premuto (ad esem-
    9            22                   monitor (il display si accende)                                        pio il 5) venga riconosciuto una sola
   A             FE                                                                                          volta. In pratica infatti anche nel pur

                                                                                                                                                      81
```

## Pagina PDF 82

```text
breve tempo durante il quale il tasto                Cercate di comprendere bene l'uso del     uso questo stesso() per azzerare il FLAG.
rimane premuto il programma gira nu-              FLAG perché questo artificio viene usato     Se invece c'è qualche tasto premuto con-
merosissime volte, se non mettessimo              molto di frequente nella compilazione        tinua l'esecuzione del programma e si va
ancora il FLAG a 1 il numero 5 corri-             dei programmi.                               a controllare il FLAG.
spondente al tasto premuto riempirebbe               Ora possiamo scrivere il programma:          2) Carico il registro X con il valore
tutte le sei cifre del display invece del-        badate che questo programma contiene         contenuto nella locazione()()()() (il FLAG).
l'ultima a destra. Quando però il tasto 5         diversi passaggi interessanti dal punto di      3) Questo blocco di istruzioni permette
viene rilasciato ecco che il FLAG va              vista ottimizzazione del numero delle        di far entrare nell'ultima cifra a destra
nuovamente a zero e il programma è                istruzioni impiegate e va quindi studiato    il tasto premuto: viene eseguito quattro
pronto ad accettare un nuovo tasto.               con attenzione.                              volte perché ogni cifra è composta da
   In pratica le cifre che inseriremo, ov-           Per meglio comprendere tutti i passag-    4 bit (es.: 5 = fJHH).
vero i tasti che premeremo entreranno             gi di questo programma esaminiamo di            4) In questo modo carico nell' Accu-
dall'ultima cifra a destra e scorreranno          seguito queste note:                         mulatore la nuova parola da inserire nel-
fino alla prima a sinistra fino a sostituire      1) Uscendo da questa routine senza alcun     la locazione di pagina base F9 (cioè
tutti gli zeri del display.                       tasto premuto nell'accumulatore si ha 0,     nelle ultime due cifre a destra del display).
                                                                                               Per una miglior comprensione si veda la
                                                                                               Fig. 60.
                                                                                                  5) Le due istruzioni CLC e BCC equi-
                                                                                               valgono ad un salto incondizionato, le
                                                                                               abbiamo usate al posto del JMP perché
                                                                                               diversamente il programma non sarebbe
   f)2f){')           A9    I:DA       #$00          Carico ()() irt Ace.                      stato rilocabile (ovvero sarebbe stato le-
        1            f)()                                                                      gato alla locazione di partenza ()?()()).
        2              85 STA          SFB                                                        Facciamo notare che saltando ad
        3            · FB                                                                      IND2 (locazione f)'.()6) realizziamo un
        4              85 STA          SFA           Azzero il display                         notevole risparmio di istruzioni ripassan-
        5              FA                                                                      do su passi di programma già scritti.
        6 IND 2        85 STA          $F9
        7
        8
         9
        A INDI
                       F9
                       A9 LDA
                       fH
                       85 STA
                                       *$01
                                       $0fJ ''
                                              l      FLAG= 1
                                                                                               L'Interrupt
        B            0()
        c LOOP       2f)    JSR        SCÀNS         Rinfresco display
        D            0C                                                                           Per completare il set delle istruzioni
        E            FF                                                                        del 6')02 rimangono ancora pochi parti-
        F            2f) JSR TESTAS                  Salto alla routine di tasto attivo        colari da esaminare: vediamo ora una
  forn               EB                              (MONITOR) "·                              caratteristica hardware che ha ripercus-
        1            FE                                                                        sioni anche nel software: l'INTERRUPT.
        2            F0 BEQ IND 1                    Se ACC = 0 non vado avantì, mà               Supponiamo che ii nostro calcolatore
        3            F6                              azzero il .FLAG (1)                       stia percorrendo un suo programma prin-
        4            A6 LDX $0~                      Vedo se il FL'.AG .~. . 0 (2)             cipale. che stia per esempio contando
        5            f)f)                                                    f
                                                                                               quante volte si apre e chiude un inter-
        6            D0 BNE LOOP                     Se non è uguale a () tomo iii Loop        ruttore collegato ad una sua linea di
        7            F4                              diversamentei ontinuo il,program.         ingresso. Supponiamo che. mentre sta
        8            D8 CLD                          Funzionamento in esadecimale              eseguendo questo lavoro debba. contem-
        9            A9 ' LDA #S99                                                             poraneamente. tenere acceso un display
        A            99            ~
                                                                                               a 6 cifre aggiornando il dato che vi è
        H            8D STA CONTR                                                              scritto.
        6            03                                                                           Il vero problema è dato appunto dal
        ]i)          FD                                                                        "contemporaneamente" in quanto la
       E             20 JSR TASTO                   Salto alla strbroutine ài idèritific~-     macchina in effetti può eseguire un solo
      F              57                             zio!le del tasto e tomo col valore del     calcolo per volta: deve perciò passare in
  ()22()             FF                             tasto premuto in ACC.                      continuazione dall'esecuzione di un pro-
       1             A0 LDY #04                     Uso · Y come contatore                     gramma ali' esecuzione di un altro per farli
        2            f)4                                                                       avanzare di pari passo tutti e due.
        3 LOOP 1 ()6      ASL SF9                                                                 Questo passaggio è possibile se si
        4            F9                                                                        interrompe periodicamente il lavoro della
        5            26· ROL SFA                                                               CPU tramite un temporizzatore esterno,
        6            F,ç\                                                                      che fornisce ad un piedino della CPU un
        7            26 ROL SFB                     Eseguo 4 vo1te lo shirt per far entrare
                                                               1
                                                                                               segnale ad onda quadra di interruzione.
        g,           FB                             il tasto premuto nel display t3)              Il processor quando riceve questo
        9            88 DEY                                                                    segnale di interruzione. abbandona l'ese-
        A            P0 BNE LOOP1                                                              cuzione del programma pn.ncipale per
        B            F7                                                                        andare a servire le necessità del program-
        e            05 , ORA SF9                   Eseguo l'operazione. di OR fra il          ma secondario.
        D            F9                             contenuto di F9 e l'accumulatore (4)          Un altro esempio di interruzione può
     , È             i8 CLC                         (5}                                        essere quello di un interruttore di fine
        F            9() BCC ·1ND2                  Rirµetto a posto il digh ineng signi-      corsa che in chiusura deve interrompere
   ()23~             D5                             ficativò e vado a porre ilFLAG::::: 1      qualsiasi calcolo stia eseguendo la CPU
                                                                                               perché diversamente c'è un pistone che

82
```

## Pagina PDF 83

```text
va a sbattere rovinando la macchina con-
trollata. Alla chiusura del fine corsa al-
lora viene generato il segnale di interru-
zione e la macchina va immediatamente                 - ~ F9 X X X
                                                               I        >d ~ @ - t I contenuto locazione ~- F9
ad eseguire il programma che contiene
i vari controlli per l'arresto del pistone.
   Da tutto ciò ci si può rendere conto                        I ~- ~ - ~ IV y y v I contenuto Accumuiatore
dell'importanza fondamentale di questo
segnale che permette di controllare feno-
meni fra loro asincroni e completamente                                           -----..------~-.-. contenuto dell' ACC
indipendenti l'uno dall'altro.
                                                          F9    OR                                     I
                                                                     ACC - - ,ACC 1-X X X >ç y . y y v.I dopo l'operazione di OR




Tipi di Interrupt                                                 Fig. 60 - Operazione di OR .fra il dato contenuto nella locazione OOF'<)
                                                                                   e quello contenuto in accumulatore.


   Il microprocessore 6502 ha due diversi
tipi di ingresso di interrupt tramite piedini       piedino NMI deve tornare alto, quindi               macchina al momento dell'interruzione,
marcati con le sigle IRQ e NMI.                     ancora basso.                                       questo per poter poi tornare al program-
   La differenza sostanziale fra questi
due piedini è che IRQ è serisibile al                                                                   ma principale al punto dove era stato
livello di ingresso, vale a dire che si                                                                 arrestato. La CPU quindi preleva da lo-
genera una interruzione se il piedino               Il funzionamento della interruzione                 cazione fisse della memoria il punto da
IRQ va a () Volt mentre NMI è sensi-                                                                    cui parte la routine di gestione dell'in-
bile ai fronti vale a dire che si genera               Come risponde la CPU ad una interru-             terruzione (ovvero il nuovo programma
una interruzione se su questo piedino               zione?                                              da eseguire) che finisce sempre con una
si presenta un fronte di discesa~ cioè                 Essa interrompe l'esecuzione del pro-            istruzione di R TI. Con R TI viene ese-
se la sua tensione passa da 5 V a 0 Volt            gramma che sta eseguendo, salva nello               guita la procedura esattamente inversa
 e solo a questo passaggio (vedi Fig. 61).          Stack lo Status e il PC che vi era in               ripristinando i valori (presenti nello Stack)
    In pratica il controllo dello stato di
questi due piedini viene fatto in conti-
nuazione dalla CPU e in particolare prirria
della esecuzione di ciascuna istruzione.
Nota Bene: per il piedino NMI il fronte di
 discesa viene memorizzato da un circuitò
 interno che permette il funzionamento sul
 solo fronte.
   Un'altra differenza fra i due tipi di                                                                                           Tensione sul
interrupt è che mentre l'interruzione ge-
nerata su IRQ può essere mascherata                                                                                                piedino NMI
(ignorata dalla CPU), la CPU serve sem-
pre quella che nasce su NMI.
   Il 3° bit dello Status (bit I) serve pro-
prio a bfoccare la interruzione generata
su IRQ. Se viene posto a 1 da programma,               À questo istante e solo qui si genera un interrupt
l'interruzione non passa, se viene posto
a f) l'interrupt è abilitato.
    Normalmente all'accensione della
macchina di ha I = 1.
    Per il bit I esistono due istruzioni
specifiche:
CLI (Clear lhterrupt) codice op. 58, che
pone I = 0.
    SEI (Set Interrupt) codice op. 78, che
pone I = 1.
    Il bit I viene anche automaticamente                                                                                           Tensione $ul
messo a 1 (cioè viene disabilitato l'inter-
 rupt) dalla CPU, quando essa va a ser-                                                                                            piedino IRQ
vire una interruzione; questo perché di-
versamente la CPU continuerebbe a ser-                            \-~~~------V --~~~~~)
vire la stessa interruzione (ricordiamoci
  che siamo sensibili al livello) (vedi Fig. 62).
    La messa a O di I avviene invece trà-                       Per tutto questo peri9do di tempo
mite l'istruzione R TI (ritorno da lnter-                       la richiesta di interruzione rimane
 rupt) codice op. 40 o tramite la CLI.
    Come già detto invece l'interruzione                        attiva
 su NMI nasce solo su un fronte di discesa
 su questo .piedino e non può venire
 bloccata dalla CPU; perché avvenga una
 successiva richiesta di interruzione il                               Fig 61 - Differenza .fra le richieste di interruzione nel 6502.


                                                                                                                                                  83
```

## Pagina PDF 84

```text
                                                                                                   dello Status e del PC di partenza.
                                                                                                      Si noti che questa procedura automa-
                                                                                                   tica non prevede il salvataggio dell' ACC.,
                                                                                                   di X e di Y, salvataggi che, se neces-
                                                                             ·t>ledino IRQ
                                                                                                   sario, devono essere eseguiti dallo stesso
                                                                                                   programma di gestione dell'interrupt.
                                                                                                      I vettori di partenza delle routine di
                   ,-----------
                   I
                   I
                                          ~----------'                                             Interrupt sono posizionati in memoria
                                                                                                    secondo quanto riportato nella Fig. 63.
                   I
                   I                                       I                                       Questi cosiddetti vettori non sono altro
                   I                                       I
           .       I    .     ..    '       .        .   . I            '·
                                                                                                   che due locazioni di memoria successive
     ~ichiesta di :servizio da parte di ,        un orgànò . esterno. Rimane attiva                che contengono l'indirizzo di memoria
     fin tà~to che la terisioné sU IRQ rimane i bassa
                                                                                                   in cui inizia il programma di gestione
                                                                                                   dell'interrupt; nel caso dell' AMICO 2000
                                                                                                   sono già scritti nella PROM del Monitor
                                                                                                    (vedi Fig. 64).
                                                                                                      Notiamo subito che gli indirizzi in cui
                                                                                                   sono memorizzati i vettori di restart sono
                                                                                                   fissi e posizionati in fondo alla memoria
                                                                                                   (le ultime 6 parole dei 64k indirizzabili).
                                                                                                   È perciò che generalmente l'ultimo k del-
                   I
                                                                                Bit I              la memoria di un 6502 è di memoria
                  .lt
     istanté in'._cui la _CPU .
     va à· servire l'in~_erruzÌone
                                                               L     A questo istante la CPU
                                                                     esègue I=~- o tramite :
                                                                                                   ROM .



     aufomaticamente si verifica I= 1                                l'istruzione RTI, o tramite
                                                                                                   Il funzionamento di Reset
                                                                     la CLI
     A questo istante la ~~U esegue                                                                   Nella nomeJ).clatura dei piedini del mi-
     un azzerarrientò tramite harwaré                                                              croprocessore 6502, oltre a quelli indicati
     est~r~o della richiest~ di i~terruzion~                                                       con NMI e IRQ che abbiamo già esamina-
                                                                                                   to ne esiste uno che si chiama RES (il
                                                                                                   numero40).
                                   Fig 62 - Funzionamento dell'Jnterrupt.                             La sua funzione è quella di permettere
                                                                                                   che la CPU cominci a funzionare da un
                                                                                                   punto ben determinato. Quando questo
                                                                                                   piedino viene portato a livello logico.O(me-
                                                                                                   no di 0.8 V) il processor arresta qualsiasi
                                                                                                   attività e rimane in attesa che questo li-
                                                                                                   vello logico tomi a 1. Appena questo av-
                                                                                                   viene, automaticamente il PC viene cari-
                                                                                                   cato con i valori presenti nella tabella di
                                                                                                   Restart (vettore RESET), quindi la mac-
               FFFA                     ÀD L                                                       china inizia le sue operazioni dall'istru-
                                                                     vettore      NMI              zione puntata dal vettore di reset stesso.
                                                                                                      È evidente che in qualsiasi momento,
               FFFB                     AD H                                                       l'esecuzione di un programma può essere
                                                                                                   interrotta agendo su questo piedino.
                                                                                                      Una operazione di questo genere co-
               F F FC                   AD L                                                       munque viene eseguita ogni volta che si
                                                                     vettore RESET                 dà alimentazione al microelaboratore; in-
                                                                                                   fatti, si vada a vedere lo schema elettrico,
               FFFD                     AD H                                                       un gruppo di ritardo formato dalla resi-
                                                                                                   stenza Rl e dal condensatore C3 permette
               FFFE                                                                                all'alimentatore di stabilizzarsi prima di
                                        AD L                                                       portare a livello logico 1ì1piedino40 della
                                                                     vettore IRQ                   CPU 6502.
               F F FF                   Ai:> H

                                                                                                   Esempio dell'uso di Interrupt
               AD L = -p arte bassa dell'indirizzo di partenza
                      della . routine di gèstione
                                                                                                      Per usare l'lnterupt nell'AMICO 2000,
               AD H =parte alta                                                                    che ha i vettori di partenza fissi sulla
                                                                                                   PROM del Monitor, si ricorre ad un
                                                                                                   artificio di programmazione presente nel
        Fig 63 - Posizionamento in memoria dei veuori d1 parten::a della routine di Interrupt.     monitor stesso.

84
```

## Pagina PDF 85

```text
                                                                                           la routine .che serve l'interruzione.
f)2f)t)           A9    LDA #SOO
                                                                                              2) in questo Loop il programma gira
     1            00
                  8D    STA    $03FC                                                       su se stesso tenendo spente tutte le cifre
     2
                                                                                           del display.
     3            FC
                  f)3                        Caricamento del vettore di restart di            A questo punto l'unico sistema che
     4
                  A9 LDA #$03                NMI (locazione f)JOO)                         consente di intervenire sulla macchina è
     5
     6            03                                                                       il ricorso all'interrupt Useremo l'NMI
                  8D STA $03FD                                                             per via della presenza del tasto HL T.
     7
     8            FD                                                                          3) Alla locazione f)300 comincia la rou-
     9            03                                                                       tine di interrupt.
     A Loop       18 CLC
     B            90 BCC Loop                Il processor continua a girare in que-           Si noti che per il loop di ritardo non
     c            FD                         sto punto (il display si spegne)              si usano i registri indice X e Y poiché
                                                                                           la routine di scansione del display li
Scriviamo la routine                                                                       modifica. Durante il loop di ritardo il
che serve l'interruzione:                                                                  display rimane acceso mostrando tutti 8.
                                                                                              Come ultima nota avvertiamo che se
f)300             A9 LDA #$88                                                              si preme ancora il tasto HL T mentre il
    1             88                                                                       display è acceso esso continuerà a rima-
    2             85  STA SFB                                                              nere acceso perché non si esce più dalla
                  FB                                                                       routine di interrupt.
    3
    4             85 STA SFA                 Carico 88 sul display
    5             FA
    6             85  STA SF9
     7            F9
     8            A9 LDA #$10
     9            10
     A            85 STA $00                                                               Funzionamento in Single Step
     B            00
     c            A9 LDA #$00                Parametri della routine di ritardo
    D             00                         (durata accensione display)                       Sull'AMICO 2000A esiste un inter-
    E             85  STA $01                                                              ruttore per il funzionamento della mac-
    F             01                                                                       china in "Single Step" o passo singolo
f)310 Loop 1       20 lSR SCANS              Routine rinfresco display                     che fino ad ora non abbiamo utilizzato.
    1             oc                                                                           Con questo tipo di funzionamento è
    2             FF                                                                       possibile esaminare istruzione per istru-
    3             C6    DEC Stn                                                            zione lo svolgersi di un programma f er-
    4             01                                                                       mandosi ad esaminare per ogni passo
    5             D0    BNE Loop 1           Routine di ritardo                            (step) il contenuto dell'accumulatore e
    6             F9                                                                       degli altri registri di macchina. Ciò è
     7            C6    DEC $00                                                            molto utile quando, ad esempio, non si
     8            00                                                                       riesce a comprendere perché un certo
     9            D0    BNE Loop 1                                                         programma non va come vorremmo e
     A            F5                                                                       scoprire quindi dove è stato fatto l'errore.
     B            4f)   RTI                  Ritorno al programma principale                   Per poter utilizzare la macchina in sin-
                                                                                            gle step prima di tutto è necessario ca-
                                                                                            ricare i dati 00 e FE rispettivamente
                                                                                           alle locazioni 03FC e 03FD. Si provve-
                                                                                           derà quindi a scrivere il programma sul
                                                                                           quale si intende operare in single step
  Le routine di NMI e di IRQ si ridu-            Per fare un esempio dell'uso di inter-    badando che il programma stesso non
cono ad un salto indiretto sul contenuto     rupt dobbiamo avere a disposizione un         vada ad interessare le locazioni 03FC
delle locazioni di memoria RAM (quindi       segnale hardware che generi l'interrupt       e 03FD.
modificabili dall'utente) che sono:          stesso. Osservando lo schema elettrico            Si porta ora sul display indirizzi la lo-
                                             dell' AMICO 2000, si può vedere che il        cazione di partenza del programma quin-
                                             tasto di HAL T (HL T) quando è premuto        di si sposta a destra l'interruttore del
f)3FC = ADL di NMI                                                                         single step.
                                             genera su NMI (piedino 6) un fronte di
                                             discesa di tensione. Possiamo perciò sfrut-       A questo punto premendo il tasto
03FD = ADH di NMI                                                                          RUN vediamo che sul display appare
                                             tare questo tasto per generare una inter-
                                             ruzione.                                      l'indirizzo della seconda istruzione del
03FE = ADL di IRQ                                                                          programma e, sui due digit dei dati, il
                                                Facendo girare il programma che se-        contenuto esadecimale della locazione
03FF = ADH di IRQ                            gue vedremo il display spegnersi per          di memoria corrispondente.
                                             accendere per circa 16 secondi tutti 8            Procedendo in questo modo (premen-
   Quindi nei nostri programmi utente        sul display ogni volta che viene premuto      do ad ogni istruzione RUN) si può esa-
dobbiamo inserire, prima di usare l'in-      il tasto di HL T.                             minare lo sviluppo del programma, i vari
terrupt, i nostri specifici vettori di re-   Analizziamo il programma:                     salti o condizionamenti.
start in queste locazioni di RAM (ov-                                                          Se si desidera esaminare, dopo l'ese-
vero l'indirizzo dal quale deve partire la     1) Si caricano i vettori di restart, ov-    cuzione di una determinata istruzione,
routine dell'interrupt).                     vero la locazione dalla quale deve partire    il contenuto di un qualsiasi registro o

                                                                                                                                     85
```

## Pagina PDF 86

```text
                                                                    locazione di memoria della macchina
                                                                    sarà sufficiente portarsi all;indirizzo corri-
                                                                    spondente al registro o alla locazione
                                                                    desiderata secondo quanto indicato di
     FFFA             1e                                            seguito:
                                                  vettore     NMI   00F3       Accumulatore
     FFFB                                                           00F4       Registro Y
                      FE                                            00F5       Registro X
                                                                    00F6       Program Counter (parte bassa)
     FFFC             22                                            00F7       Program Counter (parte alta)
                                                                    00FD = Status
                                                 vettore .RESET     00FE = Stack Pointer
     FFFD             FE                                               Nel caso si desideri modificare uno
                                                                    qualsiasi di questi registri si procede al
     FFFE                                                           solito modo.
                      1F                                               Per riprendere l'esecuzione in single
                                                 vettore      IRQ   step del programma è sutficiente richia-
     FFFF             FE                                            mare il Program Counter premendo il ta-
                                                                    sto REG e di seguito il tasto R UN passan-
                                                                    do così alla prossima istruzione.
                                                                       Si badi bene che nessuna delle ope-
                                                                    razioni di analisi dei vari registri o lo-
                                                                    cazioni modifica di per se stessa i dati
            Fig. 64 - Vettori di restart de/i'AMICO 2000/A.         del programma.




86
```

## Pagina PDF 87

```text
                                                                 CAPITOLO IX




                 ULTIME ISTRUZIONI DI INDIRIZZAMENTO




    n questo ultimo capitolo dedicato al-        nuto di una locazione di memoria pos-

I   l'analisi del software di base della
    CPU 6502 spiegheremo l'utilizzo
delle ultime istruzioni del microproces-
sore, mentre verranno analizzati nuova-
                                                 siamo eseguire un'istruzione BIT, che
                                                 porta il bit di segno (M7) nello Status,
                                                 permettendoci di conoscerlo senza altre
                                                 operazioni.
mente i sistemi di indirizzamento  propri           Vediamo con un esempio pratico di
di questa CPU la cui comprensione                analizzare l'istruzione di BIT:
permette il più completo impiego dello
stesso microelaboratore.
                                                 ()2()()   A9      LDA       #$AS             Numero arbitrario caricato in accumulatore
   Esaminiamo dapprima le seguenti                    1    AS
istruzioni:                                           2    24      BIT       $0()
   BIT (compara i bit di una locazione                3 ()()
di memoria con il contenuto dell'accu-                4    ()8     PHP                        Portiamo lo Status nello Stack, per poi
mulatore). Codici operativi: 24 con indi-             s 68         PLA                        riprendelo in accumulatore Ol
rizzamento in pagina zero; 2C con indi-               6 8S         STA        $01             Memorizzo della locazione ()001 lo Status per
rizzamento assoluto.                                  7 ()1                                   poi esaminarlo
   Questa istruzione esegue 1' AND fra il           8 4C           JMP       Monitor
contenuto dell'accumulatore e il conte-             9 22
nuto di una locazione di memoria il cui          t>WA FE
indirizzo è indicato nella seconda parte         Ol Questo è l'unico modo per poter trasferire lo Status nell'accumulatore.
dell'istruzione.
   Il risultato della operazione di AND
non compare da nessuna parte, non va a              Introducendo un numero nella loca-                 Ovviamente questi risultati valgono per
interessare (modificare) nessun registro,        zione di memoria ()()()() e facendo partire          i tre bit di stato interessati, gli altri
ma influenza soltanto alcuni bit dello           il programma, troveremo nella locazione            non vengono influenzati dall'istruzione.
Status.                                          00()1 il contenuto dello Status.                   Vediamo ora un altro utilizzo pratico
   In particolare, se il risultato dell'opera-       Negli esempi di seguito useremo le pa-         della istruzione di BIT per quanto riguar-
zione logica AND è stato uno ()(), viene         rentesi per indicare che si tratta del con-        da in particolare la modifica del bit Z
automaticamente posto il bit Z = 1, altri-       tenuto di quella locazione: (0()()()) = equi-      dello Status.
menti si ha Z = 0.                               vale a: "il contenuto della locazione di              Quando vogliamo sapere se uno qual-
    Il secondo effetto di questa istruzione      memoria 00()() è".                                 siasi degli 8 bit di una locazione di me-
 è quello di portàre il bit più significativo       Per esempio se si ha (f>()OO) = SA              moria è a () o a 1, dobbiamo procedere
 del contenuto della locazione di memoria        troviamo (00()1) = 76.                             ad una cosiddetta mascheratura della
interessata (M7) nel bit N dello Status             Infatti SA = 01()11()1() e i primi due          parola, cioè ad una operazione di AND
 e il bit successivo (M6) nel bit V dello        bit sono () e 1, quindi N = 0, V = 1               fra la parola stessa e una parola che ha
Status (si veda la Fig. 65).                     nello Status.                                      tutti i bit a () salvo quello che ci inte-
    Facciamo notare ancora che la carat-            Inoltre SA AND AS =O, quindi Z = 1              ressa mascherare e che viene posto a 1.
teristica più importante di questa istru-        nello Status.                                         Una delle ragioni per cui potrebbe
zione è proprio il fatto che la sua ese-            Se si ha(()()()()) = 5B si ha (f)()()l) = 74,   interessarci l'analisi di un bit specifico
cuzione non va ad interessare nessun             cioè Z = 0, in quanto SA AND SB f 0.               è per esempio quando vogliamo tenere
registro e nessuna locazione di memoria             Verificate i seguenti risultati utilizzano      8 flag contemporaneamente in una stessa
salvo, ovviamente, lo Status.                    il precedente programma sull' AMICO                locazione di memoria, sia per risparmiare
    Con questo, se durante la stesura di         20001 A:                                           RAM, sia per risparmiare istruzioni quan-
un programma vogliamo conoscere il               (000()) = 77; (0()()1) = 74                        do vogliamo esaminare più di un flag
segno (positivo o negativo) del conte-           (()00()) = 01; (0()()1) = 34                       alla volta.

                                                                                                                                            87
```

## Pagina PDF 88

```text
     Vediamo subito un esempio pratico:            Indirizzamento assoluto. Il secondo by-       ID     ORA 002B,X (con X = 02)
si vuole esaminare se il bit 4 di una           te dell'instruzione contiene la parte bassa      2B
certa locazione di memoria è a 1.               dell'indirizzo della locazione di memoria        0f)
     Facendo riferimento alla Fig. 66 ese-      interessata; il terzo byte la parte alta del-    e l'indirizzo calcolato sarebbe ancora
guiamo una mascheratura della locazione         l'indirizzo.                                     002B + 02 = 002D.
di memoria M con la parola 10 contenuta             Si voglia per esempio paragonare il
in accumulatore.                                contenuto del registro indice X con il              Indirizzamento indicizzato indiretto.
     Il risultato, che mediante l'istruzione    contenuto della locazione di memoria             (IND,X). Il secondo byte dell'istruzione
di BIT non compare da nessuna parte,            ()354; si scrive:                                viene aggiunto al contenuto del registro
influenza il bit di Status Z. A questo                           CPX $ 0354                      indice X (senza tenere conto del Carry).
punto, se il bit Y che volevamo analiz-         e si traduce in:                                 Il risultato punta su una locazione in
zare è uguale a (}, il risultato dell'opera-                                                     pagina zero, che contiene gli 8 bit più
zione di BIT è uguale a () e quindi             EC        1° byte - Codice operativo di CPX      bassi dell'indirizzo effettivo. Il byte suc-
Z = 1; viceversa, se Y è uguale a 1.                      con indirizzamento assoluto.           cessivo della pagina zero contiene gli
     Lo stesso risultato lo avremmo ottenu-     54        2° byte - Parte dell'indirizzo della   8 bit più alti dell'indirizzo effettivo.
to se invece della istruzione di BIT                      locazione di memoria interes-             Esempio. Supponiamo che X = 04 e
avessimo utilizzato l'instruzione AND                     sata.                                  che (00()6) = 34 e (()()()7) = 02.
che però avrebbe modificato il contenuto        ()3       3° byte - Parte alta dell'indirizzo       L'istruzione:
dell'accumulatore.                                        della locazione d.i memoria inte-
     BRK (istruzione di Break). Codice ope-               ressata.                               21     AND (02.X)
rativo 00. È un'istruzione che opera in                                                          02
maniera simile all'interrupt Si ha il salva-       Indirizzamento dell'Accumulatore. È
taggio in Stack del (PC) + 2 e dello            relativo alle istruzioni di un solo byte         calcola l'indirizzo della locazione di me-
Status, quindi il PC viene caricato con         che operano sull'accumulatore stesso             moria dalla quale prelevare il dato ese-
 il contenuto delle locazioni di memoria        (sono le istruzioni di Shift e Rotazione).       guendo 02 + X = 06.
FFFE e FFFF.                                                                                        Nella locazione ()f)f)6 è contenuta la
     L'uso di questa istruzione è piuttosto        Indirizzamento in pagina zero. Il 2° by-      parte bassa (34) dell'indirizzo della loca-
 complicato ed esula dai propositi di que-      te dell'istruzione contiene la parte bassa       zione di memoria effettiva interessata
 sta trattazione.                               dell'indirizzo della locazione di memoria        dalla operazione di AND. mentre la par-
      NOP (nessuna operazione). Codice          interessata. La parte alta dell'indirizzo è      te alta (()2) dell'indirizzo è contenuta
 orativo EA.                                    sott'intesa in quanto è sempre 00.               nella locazione di memoria successiva
      Questa istruzione non fa nulla e vi          Esempio. Si voglia eseguire uno Shift         OOfJ7; l'indirizzo della locazione di me-
 chiederete allora a che cosa serve. Faccia-    a destra della locazione di memoria              moria effettivamente interessata è quindi
 mo un semplice esempio: si abbia un            0013 e cioè:                                     lo ()234.
 programma in cui momentaneamente si                             LSR S 13
 deve levare una istruzione per controllare                                                          Indirizzamento indiretto indicizzato
 se è quella che non lo fa funzionare.                Questa istruzione si traduce in:           (IND),Y. Il secondo byte dell'istruzione
 Sarebbe poco pratico riscrivere tutto il                                                        punta su una locazione in pagina zero.
 programma, fare la prova, poi riscriverlo      46        1° byte - Codice operativo cli LSR     Il contenuto di questa locazione di me-
  nuovamente: è molto più semplice sosti-                 con indirizzamento in pagina zero.     mona viene aggiunto al registro indice Y.
  tuire l'istruzione dubbia con una che         13        2° byte - Parte bassa dell'indirizzo   Il risultato sono gli 8 bit più bassi del-
  non fa niente! Possiamo suggerire anche                 dela locazione di memoria interes-     l'indirizzo effettivo. Il Carry della prima
  l'impiego di questa istruzione, scritta di-             sata.                                  somma viene aggiunto al contenuto del-
  verse volte di seguito, in quei punti del               La parte alta dell'indirizzo è sot-    la successiva locazione di memoria di
  programma nei quali si pensa di dover                   t'intesa perché è 00.                  pagina zero e il risultato sono gli 8 bit
  eseguire delle modifiche, sempre per                                                           più alti dell'indirizzo etTettivo.
   non dover nscrivere tutto ogm volta.                                                             Esempio. Supponiamo che Y = 04 e
                                                   Indirizzamento in pagina zero indiciz-
                                                                                                 che (0002) = FC e (0003) = 01.
                                                zato (Z. PAGE,X - Z. PAGE,Y). Il se-
                                                                                                    L'istruzione:
                                                condo byte dell'istruzione viene som-
                                                mato, senza tener conto del Carry, al            11 AND (02),Y
Sistemi di indirizzamento                       contenuto del registro indice indicato           02
del 6502                                                                                         preleva il byte puntato dal secondo byte
                                                nella istruzione. Il risultato di questa
                                                                                                 dell'istruzione (02), lo somma a Y ot-
                                                operazione è la parte bassa dell'indirizzo
                                                della locazione di memoria interessata.          tenendo la parte bassa dell'indirizzo della
                                                La parte alta dell'indirizzo è sempre zero.      locazione di memoria interessata; la par-
   Riprendiamo in questa sede in manie-            Esempio. Se scriviamo:                        te alta si ottiene sommando l'eventuale
ra organica questo importantissimo              15      ORA 2B,X        (con p.es. X = 02)       Carry alla locazione di memoria succes-
aspetto del software del microprocessore.       2B                                               siva a quella puntata dal secondo byte
  Indirizzamento immediato. L 'operando            Eseguiamo l'OR fra il contenuto del-          dell'istruzione; nel nostro caso si esegue
è contenuto nel secòndo byte dell'istru-        l'accumulatore e il contenuto della loca-        tnFC + 04 = 02M, che è l'indirizzo
zione.                                          zione di memoria 002B + 02 = 0020                effettivo da cui prelevare il dato.
   Esempio. Se si vuole caricare il numero
lB nell'accumulatore si scrive:                     Indirizzamento indicizzato assoluto
                                                 (ABS,X - ABS, Y). L'indirizzo della lo-
                   LDA = 1B                      cazione di memoria interessata viene cal-       Un esercizio
e si traduce in:                                 colato, senza tenere conto del Carry,
                                                 sommando il contenuto del registro in-
A9 1° byte - Codice operativo di LDA             dice indicato nell'istruzione al 2° e al 3°        Per mettere alla prova la vostra capa-
lB in maniera immdiata.                          byte dell'istruzione stessa.                    cità di apprendimento delle istruzioni
lB 2° byte - Dato immediato da caricare             L'istruzione dell'esempio precedente         del microelaboratore vi diamo le specifi-
   nell'accumulatore.                            l'avremmo scritta:                              che per la costruzione di un programma

 88
```

## Pagina PDF 89

```text
     Numero del          ~      7   6   5        4       3        2       1     '
       BIT                                                                            ~Locazione di memoria M


                                                                          r--(M)A(ACC) ci~ ANO fra ii contèn~to
                                                                          f            di Me l'ACC, il tutto negato
                              ..-+-~~~~~~~~--.

                                                                                      ~STATUS

                                NV               BDIZC




Fig. 65 -Effetti dell'istrnzione BIT sui bit dello Status. - - - - - - - - - - - - - -



che vi consentirà di utilizzare diversi dei                                     te poi a scrivere il vero programma fa-
metodi di indirizzamento che abbiamo                                            cendovi guidare dal flow-chart prece-
rivisto in questo articolo. Come al soli-                                       dentemente ideato.
to, prima di scrivere la prima istruzione                                          Passiamo alla descrizione di ciò che il
chiaritevi le idee costruendo un flow-                                          vostro microelaboratore deve fare: cer-
chart dell'intero programma, verifican-                                         care fra la locazione FEOO e la FE2f)
done sulla carta la validità logica; passa-                                     il byte 85; porre nella locazione di me-




                                                                                               .x•
                                            7 6              5        4        3      2   1
           X : bit il cui stato
               non interessa            lx           X       )(       y        X      X   X:                 M

                                                                  ANO
           Y: bit da anaìizzare
                                        Io o o                                  o o o            ò           ACC




                                        I ooO·                        V         o o .o           o           Rj~ultato che nòn
                                                                                                             coms>are in nessun
                                                                                                             registro:
                                                                                                             SeY:. ,Z:1                 llll>.ria 0000 il numero delle volte che
                                                                                                             sev~ 1      ,z.;            questo byte è stato trovato; nelle loca-
                                                                                                                                        zioni successive di pagina zero 01 - 02 ,
                                                                                                                                        ()3 - 04, etc. (a coppie) l'indirizzo (prima
Fig. 66 - Esecuzione de/l 'operazione di mascheratura.                                                                                  la parte bassa, poi quella alta) in cui è
                                                                                                                                        stato trovato iL byte in questione.
                                                                                                                                           Cercate come sempre di ottimizzare il
   Programma del tiro a bersaglio. Locazione di partenza del programma 8289.                                                            programma usando il minor numero di
                                                                                                                                        istruzioni.

   (Li 1H1 ==1~.? nil F{(; F9 i=;ii F I~ H6 FB 1~19 i::; Fl:) nii C.1:'.1 H,.:, i) I :=lt\
   n::; ·1 o :::1-,::; ,::.~;; n? ·1 o l"i r, :; n H,.:., n·:·; ;.= 9 : ~:F n9 ne H~=i r.(i ',i<;- m::
   n;; ? n == >:;~=; n;.; i":li n'~ r:. o n,~. ,:~ ~~ n:.~ •=:~=i rH· e,; n ;;- 1~.~=i n 1 ::rn
   n:;-.:w ==:Cli r. ~=i nn n1; Lit\ Cii~~·;:· nH :=i::;i r. :=i ni=: ·;;ii r1t~                                       FF ·?n
                                                                                                                              °"'
                                                                                                                                ~=i:;
                                                                                                                                        Un gioco: il "tiro al ·bersaglio"

   il ;;,~.n ::FF (~!=i rìt1 Fii            1-;.: H!~i            [Ìl;        i-:~>   I li Eli       i'1C .-=l~) D.l   In OH l~l?
   n::; ~=i r. ::: n,.; F:.•i r, ·1 ~<,; n? r..l) n 11 t~9 := i~; i=:r, n:=: n:i .~1 ;1                                w=i t\ n 1~~         Un po' di relax con questo gioco che
   n;;,.:,i1 ==1.:,·;• on F'1 r,1 r.•O n:=: ~:;n i::n n;; F'~· r;;·; rio n;.= .q<;· ?t. C9                                               consiste di un bersaglio mobile che parte
   i"IY?ìi ::::;;:i ì-:.n ·1n '~~) n'? :=:i1 nr: FH I~{ ,~.:=; F9 ,..:,<;; i'1 i i=:~=; F'1' t1~i                                        dalla destra del display per poi "sparire" al
   O~iBfl ::FF           ~~!=i fJ7 :=m li f1 FD FH". fl I Fi"1 («:, rm nn 1=-c: Bi=; BB Ct~                                              di là dell'ultima cifra a sinistra: è proprio
   li?9ii :::·j f'I      r.F r·s· FF l)(ì O·'i ~·~!=; 1"1·•t :=i~) C·~=; (~ !=.i n I ?~=i l')it ~jfl i)~~                               in questo punto che il proiettile, che si fa
                                                                                                                                        partire con la semplice pressione di urt
   n~i1~,,-,         I :, r.;; ?ii fiC FF ?fl ~=;7 FF r:;;· ·1:~ no F.•i &H": nn O?
               :: 1~·C
                                                                                                                                        tasto qualsiasi, deve raggiungere il bersa-
   ii) 1:; o
           :::11 ·1 '~· n ru=: nH o~{ 1rn JF: ~-~~) i;;;; ,i:.• ~=i 9~=i t"\~=i 9 li t=:~=; 9 t t~ :;                                   glio mobile per colpirlo facendo accen-
   n:;r.11 :: •}'i F:::=; ~.~ I ":>'~·· i;·~? i: 1~1 .1 o F 9 1~11) 'i ? oo .~di                                                        dere tutti i segmenti dì quest'ultima cifra.
                                                                                                                                        I colpi a disposizione sono 20 e si pos-
                                                                                                                                        sono sparare anche in successione, ma
                                                                                                                                        senza sprecarli.

                                                                                                                                                                                  89
```

## Pagina PDF 90

```text

```

## Pagina PDF 91

```text
                                                CAPITOLO X




                                    IL LISTING DEL MONITOR




Software                                             POSIZIONI RISERVATE AL MONITOR E éLLOC~T E
                                                                lN · PAGÌNA BASE  .


 n      el corso della trattazione riguar-
        dante il software dell 'AMICO
        2000/ A abbiamo spesso fatto _ri-
 ferimento al programma di monitor.
  Quest'ultimo è assimilabile al cisiddet-
                                                                     O,OFO
                                                                     aof:··1
                                                                     OOF2
                                                                     OOF3
                                                                    ~ OOF3
                                                                                    :;; CONT
                                                                                    :.:NON UGATA
                                                                                    =FLATAS
                                                                                    =LAST .
                                                                                    : :f-1 CC
                                                                     OOF4·          ::.: REGY
 to sistema operativo dei grandi                                     OOFS           ::.:REGX
elaboratori e come questo provvede a
                                                                     OÒF6           =:PGL
gestire il funziona.mento dell'intero mi-                            OOF-7          :'-' f'GH
crocomputer. Senza di esso insomma                                   OOF8           :.: 1 hl.L
il microelaboratore non sarebbe altro che                            OOF9           =INH
un insieme di circuiti integrati seriza vita.                        'ciQFA         =:POINTL
    Del programma di monitor abbiamo                                 80f Ei         =· PfllNTH
 analizzato nel nono capitolo di questo                              OOFC           =TE:t!IF;Q
 libro un importante gruppo di subroutine                            QOF'D          :::REGP
che ci permettevano di usare il port                                 O_()FE         :: UTILE
                                                                     OQFF           =MODO
esterno di I/O, la tastiera e il display
come periferiche dello stesso sistema in             DEFINIZIPNI                DELL'INPU T /OUTP~T
modo da farle funzionare come è ri-
chiesto dai programmi che scriviamo.                                 FDOO           :::PORTA
    Per poter usare ora la scheda AMICO                              FDOf           ::.:f'ORTB
2000 al massimo della ~ua potenzialità,                              FDOé!          =P.ORTC
per poter scrivere prpgrammi complessi                               Fl.'.>b3       =PEF
e per poter riconfigurare, se fosse neces-
sario, la mappa della memoria del micro-             ROUTINE DI ENTRAU'                     ~lA   INTE:RRU!:o T NON
elaboratore è necessario conoscere il                           MASCl-!ERA~ IL.E:     o Df.\ BRE:f.\K
programma di monitor.
    Consigliamo però a tutti, indipenden-            FEOO            ~~    F3       SALVA          STA ACC        SALVO fiCCllM ,,
temente qal fatfo che lo utilizzino o                FE02            68                            P~.. A

meno, di cercare di comprendere il fun-              FE03            85    FD                      STA REGP       St\LVO STACK
zionamento del programma principale e                FE05            68             SAL.W-1 ·1     PLA
                                                     f'E06           8~>   F6                      ~:rA PCL.      ~) /-\l.VO F' ~è.
di ciascuna subroutine: questo sarà un
                                                     FEPB            85 f"f..\                     STf.., POJ:NTL
ottimo esercizio per apprendere come si              FTOA            68                            PL.A
scrive un programma complesso e per                  FEDE:           85 F7                         Slf..1 PCH
tenere a mente quei piccoli "trucchi"                FEOD            85 FB                         Slt-1 POlNTH
di software che spesso fanno risparmiare             r·i::OF         64 F4                         STY REGY       St-ilVO y
tempo e spazio di memoria. Fisicamente,              FÉ·t ..1        86 .f.·1:"
                                                                            _,                     STX REGX       SALVP ~
lo ricordiamo. il programma di monitor               f'E ·13         BA                            TSX
                                                     FE14            86 FE                         STX UTILE:     Sf.\L. VO STATUS
 risiede in una PROM (memoria a sola                 FE·16           20 I:IAFE                     JSR INIZIO
 lettura programmabile) tipo 9344_8, in-             F~: ·i'{        4é 30F,"E                     :JMP ATTESA
 tegrato IC9 e occupa 512 byte.
    Pubblichiamo così come lo ha scritto
 la stampante, il listing del programma.

                                                                                                                                      91
```

## Pagina PDF 92

```text
/RILANCIO DEI. VETTORI DI RESTART                                               RO~JT ~·~E PIDR IL CARICAMENTO DEL P .C. SUL
 FE1C           6C FC03 NMJRIL <JMPl $03FC
                                                                                                     f\           DISPLAY .
 FE1F           6C Ff03 IRGRIL <JMPI S03FE
                                                                                FEBC          A~          F'b     DlSF'C   LDA PCL
 RO~TINE         DI ENTRATA DA RESET                                            FEBE          85 F~\                       STA f'OINTL
                                                                                FECD          A5 F7                        LDf; PCH
 FE/::2          l>.2 ()()       RESt:T   LDX #$00    RlE.NTIW FREDD<           FECE          B:, FB                       STA POJNTH
 FE24            86 Ff.1                  STX F'OINTL                           F'i::C4       4-C :~ÒFE:                   JMP fi°f"IFSA
 FE26            86 FB                    STX POINTH
 FE28            t;2 FF          RFSET ·1 LDX UFF     RIENTRO CALDO
 FE.:l.:: A      9A ·                     TXE;                                  ROUTINE Dl STARl. DEL PROGRAMMA UTENTE
 FE?B            86 FE                      STX UTILE
 FF.:l:~D        20 DAFE:                   JSR INIZJ.O                         FEC7          Ab FE               RUNMOD LDX UTILE
                                                                                FEC9          9A                         TXS
              f\:OUT INF         PRINCIPALE                                     ~ECA          A5 FB                      LDA POINTH
 FEçlO          20 06FF ATTESA JSR SCANS                                        FECC          48                         PHA
 FT3:~          DO 05             BNt AVA1                                      FECD          AS FA                      LDA POJ.NTL
 FT3:,          8S FC'.           STA FLATAE;
                                                                                FTCF          4-E>                       F'HA
 Ff.:37         'tC :mFE          JMP ATTESA                                    FEDD          A5 FD                      LDA REGP
 FE3f.1         AS FC~   Il VA ·1 LDA F'l_f\TAS                                 FED2          48                           ~HA
 FE3C           DO F2             8NE AT 'ITSA                                  FED3          A6 FS                        LDX REGX
 FE:~E          E6 Fé.'.                    :J.NC FLATAf.ì                      FEDS          A4 F4                        LDY REGY
 FE:t,.()       c'. 0 D6FF .                JSR SCANS
 FEJt3           FO      rn                 BEG ATlTf.ìA                        FED"l         AS F3                        LDA ACC .
 FEJt S          20 D6FF                    JSI~   su,NEì                       FED9          40                           RTI
 FEJt8           FCJ E6                     E:FG l1TTESA
 FE:4A           é' O S "i'FF               JSR TASTO LEGGO IL TASTO
 Ff:4D           C9 ·15                     CMP #$15 '                                     ROUT~NE              DI INIZIALIZZAZIONE
 FE4F            ·10 nr:                    BPL ATTESA
 FF:d            1_,,2 ·1s                  LbX ~$15 · PULSO IL DISPLAY         FEDA          f1P D·I              1 NI ZIO U1X   #~:,() ·1
 ~- E5:~         AD FF           LOOP1      LDY #SFF                            FEDC          86 rF                        STX    MODO
 FE:' :'         88              LOOF'é'.   DEX
 FE:,6           DO FD                      BNF LOOP2                           FE:L>E:       /\2 99                       LDX    #$99
 FT:•8           C/1                        DEX                                 FE:E:O        BE o:~FD                     STX    DEF
 FE~,c;>         DO FE>                     BNE LOOP ·1                         FEE3          A2 07                        LDX   #$-07
 FT5E:           (:9 ·111                   CMF' #$ '14                         FFE5          BE OffD                      Eìl X PORTB
 FT~ 1 D         FD :,D                     8EG DISPC DISPLAY P.C.              FEE8          DB                           CLD
 FF:>F           ccl'    ·1CJ               CMP #$Hl                            FEE9          78                           SEI
 FT6·1           FD 2C:                     BEG ADMOflE INPUT INDIRIZZO         FEEA          60                           RTEì
 FT6~3           C9      ·1 ·1              CMP U·i1
 FF.:65         · FO 2C                     BEG DAMODE INPUT DATO
 FF67            cc;· ·1é~                  tMP ti:S ·1 2                                  RÌOUTJNE Dl Tt-\STO ATTIVO
 FF6<f           FO C'.F                    BEG NEXT         PROSSIMO DATO
 FF6E:           CC,' ·1 ~;                 Cl1P #$B                            FEEB          AO      03   TESTAS          LDY 1$03   TRE RIGHE
 FF6D            FCl 4A                     8EG RUN          START F'ROGRAMMA   FEEb          A2      01                   LDX #$01   DIGIT ZERO
 FE6F            CJ/1                       ASL A .
                                                                                FEEF          A9      FF   RETASR          LDA #SFF
 FElD            D/1                        ASL A                               FEF1          BE      01FD ENDTAS          STX PO~TB CARICO PORT B
 FL "l·i         CJ/.1                      ASL A
 FO??            ()/.1                      MiL    A
                                                                                FEF4          fB                           INX
                                                                                FEF5          E8                           lNX        NUOVO DIGIT
 F073            85 FC                       STA TEMPO        DEPOS. TEMPOR.    FEF6          2D OOFD                      AND PORTA LEGGO PORT A
 F075          . f\é~ 0't·                   LDX #$04                           FEF9          8B                           DEY
 FE77            M FF            Dt-\TO  MODOLDY                                FEFA          DO      F~                   ~NE ENDTAS lEST PER FINE
 F'E"l9          DO DA                   ADDRBNE    TEST DEL MODO
                                                                                FEFC          AD      07                   LDY 1$07   RIPRISTINO
 F'E"lB          B·1 Ft;                     LDA
                                         CPOINTLJ ',Y
 FF.:7D          Q6 FC                       ASL
                                         TEMPO          .                       FEFE          8C      01FD                 STY PORTB
 FE7F            2A                      A   ROL                                FF01          09      80                   ORA #$80   MASCHtRA
 FEBO            9·{ f ' A        ~:ìT A < P OI NTL ) , Y
                                                                                FF03          49      FF                   EOR #$FF
 FEf:~é'.        4C Bf\FT         JMF~ Df.1TO ·1
                                                                                              60                           RTS
 FE85            OA        ADDR   ASL A             SHIFl CARAT.
 FE86-           26 FA            ROL POINTL SHIFT IND.LOW
 FE88            26 F8            ROL POINTH S~IFT IND.HIGH                               ROUTINE DI SCANSJONE DEL DISPLAY
 FTBÀ            CA        DAT01 DEX
 FEBB            DO FA            BNE DATO          QUATTRO VOLTE               FF06          AO 00   SCANS LDY #$00    PRELEVO DATO
 FEBD            FO 08            BEG DAT03                                     FF08          81 FA          LDA <POINTL> ,y
 FEBF            A9 01     ADMODE LDA IS01                                      FFOA          85 F9          STA INH
 FT9·1           DO Oc~           BNE DAT02 .                                   FFOC          A9 89   SCANDl LDA #$89   INZ. 82~5
 FE.93           A9 00     DAMODE LDA 1$00                                      FFOE          8D 03FD        STA DEF
 FE'7':,         BS FF     DAT02 ST~ MODO                                       FT 1 ·1       Ac'. 09        LDX fi:$09 PREf>ET CONT.
 FE:ci'7         4C 30FE DA103 JMP ATTESA                                       FF13          ~O 03          LDY #$03
 FÌ::ctA         A2 FF     NEXT   LPX #SFF                                      FF15          89 F800 SCANS1 LDA lNL,Y PRELEVO BYTE
 n :c;oc         86 F'O           srx CONT                                      FF18          4~             LSR A
 FF"i>E          20 SOFF LOOP3 JSR INCPT                                        FF19          4A                           L$R    A
 FU\'1           20 06FF LOOP4    JSR SU1NS                                     FF1A          4A                           LSR A
 FEt14           20 S7FF          JSR ~ASTO                                     FF1B          4A                           LSR A              ISOLO MSD
 FEA7            C9 12            CMP #$12                                      FF1C          20 35FF                      JSR CONDAT         SUL DISPLAY
 FEA9            DO 07            BNE AVA2                                      FFff          ec;· FEIOD                   l.DA INL, Y        PRELEVO BYTE
 FEAfi           C6 FO            DEC COUNT                                     Ff22          29 OF                        AND #$0F           ISOLO LSD
 FE:t:.iD        DO F2            BNE LOOP4                                     FF24          20 35FF                      JSR CO~DAT         SUL DISPLAY
 FÉ:AF           4C 9EFE          JMP LOOP3                                     FF27          BB                           DEY
 FEE:P           A2 FF     AVA2   LDX ISFF                                      Ff28          DO EB                        BNE SCANS1
 FEBlt           86 FO            STX COUNT                                     FF2A          BE 01FD                      STX ·PORTB         DIGIT OFF
 FE86            4C 30FE           l~P ATTESA                                   FF2D          A9 99                        LDA ~$99           INIZ. 8255
 FE89            4C C7FE RUN      ~M~ RUNMOO                                    FF2F          8D 03FD                      STA DEF


92
```

## Pagina PDF 93

```text
FT32       4C     E:BFE    JMP TESTt1S                                     FFBI:'     Df.\                  t1SL. A
FF.35      Bit     CONDAT STY TEMPO SALVO y
                  FC                                                       FFB~~      011                   ASL. A
FF37       118             TAY                                             FFBlt      DA                    t1SL A
FF38       89 EAFF         L.DA lAB,X LEGGO TABELL.t1                      FTB~       A2 Olt                L.DX U04
FT3B       AO 00   DD      LDY #$00     SEGMENTI OFF                       FFB7       DA           LOOPN ,, ASL A
FF3D       BC ODFD         STY PORTA                                       FFB8       E'.6   Ft1            ROL. $FA
FF4Cl      BE OffD         STX F'Ol~TB  NUOVO DlGIT                        FFBl-1     é~6    FB             ROL. $FB
FF43       BD OOFD         STA PORTA SEGMENTI ON                           FFBC       CA                    DEX
FF46       110 ?F          L.DY #$7F    RITARDO                            FFE:D      DO F8                 E:NE: L.OOPN
FF48       88      CONVE>1 DE:Y                                            FFf:F      FU D6                 BEG CJMP
FF49       DO FD           BNE CONVE ·1
FF4B       EB              l.NX
FF.4C      FB              INX          NUOVO DIGIT                        LOCAZIONI DI MEMORIA L.J. BER E
FF4D       A4  FC          LDY TEMPO l''.IPF\J.BTINO y
FF4F       60              RTS                                             FFC1       FF FF
                                                                           FTC3       FF FF
                                                                           FFC5       FF FF
ROUTINE DI INCREMENTO PUNTATOl~E                                           FFC7       FF FF
                                                                           FFC9       FF FF
FF:,o      E6 FA          INCPT     INC POINTL                             FFCB       FF FF
FF52       DO 02                    BNE INCF'T ·1                          FFCD       FT FF
FF:,4      E6 FB                    INC POINTH                             FFCF       FF FF
FF56       60             INCF'l..1 RTS                                    FFTH       FF FF
                                                                           FTD3       FF FF
                                                                           l='FD~'    FF FF
ROUTINE DI IDENTIFICAZIONE DEL. TASTO                                      FI' D/     f f FF
                                                                           FTVi'      FF FF
FP:»7      A2 0·1    TASTO LDX #$01           DIGIT Cl                     FFDB       f f FF
FF'.:"'1   AO 0·1    TAST01 LDY #$01 7 RIGA 1                              FfDD       FF f f
FFSB       é~O EFTE            JSR RETAST                                  FFDF       FF FF
FFSE       DO 07               BNE INTAST TEST PER TASTO                   FFt: ·1    FF FF
FF60       ED 07               CPX #$07       TEEìT PER DIGIT 2            FFE3       F F FF
FF62       DO FS               BNE TAST01                                  FFf.: ~,   FF FF
FF61t      A9 ·1'.:1           LDA U.15       ·1S""NESSLIN TASTO           FFE 7      FF FF
FF6b       60                  RlS                                         FFE:'7'    FF
FF6?       AO FF     INTAST l.DY #$FF
FF6'7'     DA        1NTAS1 ASL. A
FF6A       BO D3               E:cs l.NTA82                                Tl18EL.L.l-1 PER IL. PIL.OH1GCiJ.O DEL lllSPL.f.1Y
FF6C       CB                  INY
FF6D        rn FA              BF'L. INTAS ·1                              FFE:f.1    E:F          Tt1E:         Cl
FTbF       BA        INTASI.:~ TXA                                         F'FE:E:    86                          ·1
FFlD       E'.9 OF             AND #$0F       ISOLO MSD                    FFEC       DB                         2
FFlE       4A                  l.SR A         DIVIDO PER 2                 FFED       CF                         :~
FF/3       l-1A                TAX                                         FFEE       F6                          r
                                                                                                                 't
FF74       98                  TYA                                         FFEF'      ED                         5
FF7='       rn 03              BPL. INTAS4                                 FFFO       FD                         6
FF77        18       INTAS3 CLC                                            FFT ·1     87                         7
FF78       69 07               ADC #$07       MOL.T. <X-'l>*AC             FFFC'.     FF                         E\
FT?f.1     CA        INTAS4 DEX                                            FFF3       EF                         C/
fFlB       DO Ft1              BNE I Nl'AS~~                               FFFL1      F7                         A
FF7D       60                  RTS                                         FFF=·      FC                         8
                                                                           FFF6       B9                         e
                                                                           FFF7       DE                         D
ROUTINE DI RINFRESCO DISPLAY                                               FTFE\      F9                         E
                                                                           FFF'i      F1                         F
FF7E       A'7' 89  START          L.DA #$89
FF80       8[1 03FD                STA CONTR
FF83       A''
            c. 09                  LDX #$09                                              VETTORI Dl RE:STtiRT
FFBS       AO DO                   L.DY *i\$00
FF87       89 8FOO LOOP            LJ)(.\ $008F,Y
                                                                           FFFl-1      1C FL                     NMJ.
FF8A       84 FC                   STY TEMPO                               FFFC       PI:~   FT                  RE S E T
FFBC       20 3BFT                 JSR DD                                  FFFF        H:    FF                  11·rn
FF8F       CB                      INY
FF9D       CO Ob                   CPY #$06
FF9E       90 F~~                  BCC LOOP
FF91t      60 ~                    RTS
FF9=•      FF FF                                    L.OCf.iZIONJ. LIBERE

ROUTINE Dl Cl1LCOLO f>El JMP
FF97       DB             CJMP     CL.O
FF'ìB      rn                      CL.C
FF99       AS Ft~                  L.DA POJ.NTL
FF9E:      ES FB                   SBC POINTH
FF9D       85 F'?                  BTA INH
FF'-ìF     C6 F9                   DEC INH
FFA1       20 OCFF                 JSR SCAND ·1
FFA't      20 57FF                 JSR H1STO
FF/17      es F3                   CMP LAST
FFA9       FO EC                   BEG CJMP
FFAB       85 F3                   STA U1ST
FFAD       C9 rn                   CMP #$-10
FTAF       BO E6                   E:cs CJMP
FF8 ·1     DA                      ASL A


                                                                                                                                93
```

## Pagina PDF 94

```text

```

## Pagina PDF 95

```text
                                                         APPENDICE 1




                               SOMMARIO ISTRUZIONI 6502




   Per i modi di indirizzamento e le in-         BEQ - BRANCH ON result zero.                   BVS - BRANCH on overflow Set.
fluenze sui bit di stato si rimanda alla       Esegue il salto specificato se il bit di       Esegue il salto specificato se il bit di
tabella riassuntiva delle istruzioni.          zero (Z) = I                                   overflow (V) e = I .

                                                  BIT - Test bits in memory with accu-          CLC - CLEAR CARR Y FLAG
   ADC - Add Memory to Accumulator                                                            Forza a Oil bit di carry (C) dello status.
with carry.                                    mulator.
Somma il contenuto della locazione di          Esegue un AND logico fra il contenuto
memoria specificata con il contenuto           dell'accumulatore e il contenuto della            CLD - CLEAR DECIMAL Mode
dell'accumulatore sommando anche il            locazione di memoria specificata.              Forza a Oil bit di Decimal (D) dello sta-
bit di carry (riporto). Il risultato dell'o-   Il risultato dell'operazione non compare       tus. Le operazioni aritmetiche svolte
perazione viene riportato in accumula-         in registri della macchina, però, se il ri-    successivamente, sono effettuate in bina-
tore.                                          sultato è = O, il bit di zero dello status     rio.
                                               viene messo a I, altrimenti si ha Z = O.         CLI - CLEAR interrupt disable bit.
   AND - AND Memory with accumu-               I bit 6 e 7 vengono trasferiti nello status
lator.                                                                                        Forza a O il bit di interrupt (I) dello sta-
                                               nel seguente modo N = M7; V= M6.               tus. Dopo questa istruzione la CPU è
Esegue una operazione di AND logico
fra il contenuto dell'accumulatore e il                                                       abilitata a servire le Interruzioni che do-
contenuto della locazione di memoria             BMI - BRANCH ON Rasult mimus.                vessero arrivarle.
specificata. Il risultato dell'operazione      Esegue il salto specificato se il bit di ne-
viene riportato in accumulatore.               gativo (N) è= I                                  CL V - CLEAR OVERFLOW FLAG
                                                                                              Forza a Oil bit di overflow (V) dello sta-
   ASL - Shift Left ONE BIT (Memory              BNE - BRANCH ON result not zero.             tus.
or Accumulator)                                Esegue il salto specificato se il bit di
Esegue uno spostamento verso sinistra          .iero (Z) = O.                                    CMP - COMPARE MEMORY and
del contenuto dell'accumulatore o della                                                       Accumulator.
locazione di memoria specificata. Il bit         BPL - BRANCH ON result olus.                 Compara il contenuto della locazione di
più significativo del contenuto di par-        Esegue il salto specificato se il bit di ne-   memoria specificata con il contenuto
tenza viene portato nel carry. Il bit che      gativo (N) =O.                                 dell'accumulatore. Come risultato del-
si libera viene riempito con uno zero.                                                        l'operazione vengono influenzati i bit N,
                                                  BRK - Force BREAK.                          Z, C dello status.
  BCC          BRANCH ON CARRY                 Forza una Interruzione, non maschera-
CLEAR                                          bile tramite il bit I dello Status. Salva           CPX - Compare Memory and Index
Esegue il salto specificato se il bit di       automaticamente il PC e P. Mette a I il        X.
carry (C) = O.                                 bit I dello Status.                            Compara il contenuto della locazione di
                                                                                              memoria specificata con il contenuto
  BCS - BRANCH ON CARR Y SET.                    BVC - BRANCH on overflow Clear.              dal registro x.
Esegue il salto specificato se il bit di       Esegue il salto specificato se il bit di       Come risultato dell'operazione vengon-
carry (C) = I                                  overflow (V) è = O.                            no influenzati i bit N, Z, C dello status.

                                                                                                                                       95
```

## Pagina PDF 96

```text
   CPY - COMPARE Memory and in-              meno significativo del contenuto di par-      nuto della locazione dt memoria specifi-
dex y.                                       tenza viene portato nel carry. Il bit che     cata, sottraendo anche il carry negato. Il
Compara il contenuto della locazione di      si libera viene riempito con uno zero.        risultato dell'operazione viene riportato
memoria specificata con il contenuto                                                       in accumulatore.
dal registro indice y. Come risultato del-      NOP - NO operation
l'operazione vengono influenzati i bit N,    Non esegue alcuna operazione significa-         SEC - Set carry FLAG.
Z, C dello status.                           tiva.                                         Forza a I il bit di Carry (C) dello status.

  DEC - Decrement memory by ONE.                ORA - OR Memory with accumula-
                                             tor.                                             SED - Set decimai mode.
Leva una unità al contenuto della loca-
                                             Esegue una operazione di OR logico fra         Forza a I il bit di decimai (D) dello
zione di memoria specificata.
                                             il contenuto dell'accumulatore e il con-      status. Le operazioni aritmetiche svolte
                                             tenuto della locazione di memoria spe-        successivamente, sono effettuate nel si-
   DEX - Decrement index x by ONE.
                                             cificata. Il risultato dell'operazione vie-   stema decimale.
Leva una unità al contenuto del regi-
stro indice x.                               ne riportato in accumulatore.
                                                                                              SEI - Set interrupt disable status.
                                                PHA - Push accumulator on stack.           Forza a uno il bit di disabilitazione del-
   DEY - Decrement index y by ONE.
                                             Esegue la memorizzazione dell'accumu-         1'interruzione (I) dello status. Dopo que-
Leva una unnità al contenuto del regi-
                                             latore nello stack. Lo stack pointer vie-     sta istruzione la CPU non risponde più
stro indice y.                                                                             alle richieste di interruzione.
                                             ne decrementato di uno.

                                               PHP - Push processor status on Sta-           STA - Store accumulator in memory.
   EOR - Exclusive OR Memory with            ck.                                           Esegue la scrittura del contenuto dell'ac-
accumula tor.                                Esegue la memorizzazione dello Status         cumulatore nella locazione di memoria
Esegue una operazione di OR esclusivo        nello stack.                                  specificata.
fra il contenuto della locazione di me-      Lo stack pointer viene decrementato di
moria specificata e il contenuto dell'ac-    uno.                                             STX - Store index x in memory.
cumulatore. Il risultato dell'operazione                                                   Esegue la scrittura del contenuto del re-
viene riportato in accumulatore.               PLA - Pull accumulator from stack.          gistro indice x nella locazione di memo-
                                             Esegue il caricamento dell'accumulatore       ria specificata.
  INC - INCREMENT Memory by                  con il contenuto della locazione di stack
ONE                                          puntata dallo stack pointer. Lo stack         STY - Store index yin memory.
Somma uno al contenuto della locazio-        pointer viene incrementato di uno.            Esegue la scrittura del contenuto del re-
ne di memoria specificata.                                                                 gistro indice y nella locazione di memo-
                                                PLP - Pull processor status from sta-      ria specificata.
  INX - lncrement index x by ONE.            ck.
Somma uno al contatore del registro in-      Esegue il caricamento dello status con il          T AX - Transfer Accumula tor to index
dice x.                                      contenuto dellà locazione di Stack pun-       X.
                                             tata dallo stack pointer. Lo stack poin-      Copia il contenuto dell'accumulatore
  INY - lncrement index y by ONE.            ter viene decrementato di uno.                nel registro indice x. L'accumulatore ri-
Somma uno al contenuto del registro in-                                                    mane invariato.
dice y.
                                               ROL - Rotate one bit left (memory or           TA Y - Transfer Accumulator to index
  JMP - JUMP to new location.                accumula tor).                                y.
Esegue un salto incondizionato alla lo-      Esegue la rotazione verso sinistra del        Copia il contenuto dell'accumulatore
cazione di memoria specificata come in-      contenuto dell'accumulatore o della lo-       nel registro indice y. L'accumulatore ri-
dirizzo assoluto.                            cazione di memoria specificata. Il Carry      mane invariato.
                                             viene caricato con M7, e il contenuto
  JSR - Jump to new location Saving          del carry si porta in M0.                        TY A - Transfer index y to accumula-
Return Address.                                                                            tor.
Salta ad un nuovo indirizzo, salvando in       ROR - Rotate one bit right (memory          Copia il contenuto del registro y nell'ac-
ST ACK il PC di partenza.                    or accumulator).                              cumulatore. Il registro y rimane invaria-
                                             Esegue la rotazione verso destra del con-     to.
   LDA - Load accumulatore with me-          tenuto dell'accumulatore o della loca-
 mory                                        zione di memoria specificata. Il carry             TSX - Transfer stack pointer to index
Carica in accumulatore ti contenuto del-     viene caricato con M0 e il contenuto del      X.
la locazione di memoria specificata.         carry si porta in M7.                         Copia il contenuto dello Stack pointer
                                                                                           nel registro indice x. Il registro S rimane
  LDX - Load index x with memory.              RTI - Return from interrupt.                invariato.
Carica nel registro indice x il contenuto    Esegue il ritorno dalla interruzione ri-
della locazione di memoria specificata.      pristinando dallo stack, lo status e il          TXA - Transfer index x to accumula-
                                             PC.                                           tor.
  LDY - Load indix y with memory.                                                          Copia il contenuto del registro x nell'ac-
Carica nel registro indice y il contenuto      RTS - Retur from subroutine.                cumulatore.
della locazione di memoria specificata.      Esegue il rientro da una subroutine ri-       Il registro x rimane invariato.
                                             pristinando dallo stack il PC.
  LSR - Shift right one bit (memory or                                                        TXS - Transfer index x to stack poin-
accumulator).                                  SBC - Subtract memory from accu-            ter.
Esegue uno spostamento verso destra          mulator with borrow.                          Copia il contenuto del registro x nello
del contenuto dell'accumulatore o della      Esegue la sottrazione aritmetica fra il       stack pointer. Il registro x rimane inva-
locazione di memoria specificata. Il bit     contenuto dell'accumulatore e il conte-       riato.

96
```

## Pagina PDF 97

```text
                     APPENDICE 2




PROGRAMMI APPLICATIVI PER IL MICROCOMPUTER


              Calcolatrice elettronica




                      f       \

                                         97
```

## Pagina PDF 98

```text
   Questo programma permette di simu-                                                               le due cifre corrispondenti ai dati (due
lare sull'AMICO 2000 il funzionamento         Lso                                                   cifre a destra) come cifre decimali per
di una semplice calcolatrice aritmetica.                                                            ogni numero introdotto, e così via.
Utilizzando la tastiera opportunamente          La tabella riportata specifica come il                 Vediamo ora l'uso dei vari tasti:
letta dal programma è possibile intro-        programma interpreti i vari tasti, ovvia-
durre le cifre· ed eseguire le varie opera-   mente quelli numerici coincidono. A si-           J       CL I    Azzera il display, elimina errori e
                                              nistra in alto c'è la funzione d'origine          ~·a111.:dla ogni tasto impostato. Non azze-
zioni. Ovviamente leggeremo i risultati
sul display a 6 cifre del sistema. Si noti    del tasto, a destra in basso quella asse-             ra la memoria.
che le funzioni realizzate coicidono pra-     gnata dal programma della calcolatrice.
ticamente con quelle offerte dalle calco-                                                           j+!- I Cambia il segno del numero cari-
latrici commerciali più economiche.                                                                 cato sul display, può essere usato in
Unica differenza è l'adozione della vir-                      RUN                  DA               qualsiasi momento.
gola fissa invece che di quella mobile.
Infatti lo scopo di questo programma è
                                                                  AM        RM          SM                                                    D
                                                                        REG        AD                   l lanno il ~ignilicato usuale.
essenzialmente di dimostrare come un
sistema a microprocessore, se corredato                                     MM         +            JsM I Trasferisce in memoria il valore
del software opportuno, possa realizzare
                                                                                                    prc~cnte sul display. Il contenuto prece-
le funzioni più diverse. Perciò, e per la
limitatezza del display e della tastiera                                                            dente della memoria è perso.
disponibile, non si è ritenuto utile rea-
                                                      o       1         2          3
lizzare delle funzioni più complesse.                     o         1         2            3        JRM I Trasferisce sul display il contenu-
   Precisiamo che il programma non è                                                                to Jella memoria. Il contenuto prece-
                                                      4       5         6          7
rilocabile, cioè deve essere caricato nel-                                                          dente del display è perso.
l'esatta zona di memoria indicata nel                     4         5         6            7
listing.                                              8       9         A          B                ~ Somma il contenuto del display
   Una volta caricato tutto il codice og-                                                           con quello della memoria, mette il risul-
getto bisognerà ricontrollare tutto molto                 8         9         =         CL          tato in memoria e lascia invariato il di-
attentamente per eliminare gli inevitabi-             e       D         E          F                splay.
li errori di battitura. Quindi si potrà im-
 postare l'indirizzo 04 DC (entry point                   +         -         )(
                                                                                           ..       \MMI    Moltiplica il contenuto del di-
del programma) prem~nJo il tast0 Rl 'N                                                                  ~pla)
                                                                                                           con quello della memoria, mette il
seguito da quello \CL I e         J SM I .                                                          risultato in memoria e lascia invariato il
Se tutto è a posto Jo\ ra apparir\.'. uno        Da notare come si siano sfruttati tutti            display.
zero sulla cifra più a destra, e tutto è      i tasti possibili.
 pronto per effettuare le operazioni de-         I numeri sono rappresentati da 5 ci-
 scritte in seguito. Se ciò non avviene; o    fre, con la sesta a sinistra riservata per il             l. so delle 4 operazioni
 se comunque il funzionamento è imper-        segno. Poichè la virgola è fissa, bisogne-
 fetto rispetto a qualche funzione, ciò è     rà tenere presente che un'operazionz                     Si inseriscono al massimo 5 cifre
 certamente dovuto all'errata inserzione      con risultato minore della cifra meno si-             dopo di che le ulteriori vengono ignora-
 di qualche codice.                           gnificativa (pù a destra) produrrà uno                te. Sono possibili operazioni continuate:
    Ricontrollate allora il contenuto della   zero sul display (underflow). Può, secon-             Esempio: 8 + 9: 2 x IO= 80.
 memoria cella per cella.                     do i casi. essere con\'cniente considerare               Basta premere        = : solo alla fine;
                                                                                                                              1

                                                                                                    un tasto di operazione provoca l'esecu-
                                                                                                    zione dell'operazione precedente e ne
I Programma                                                                                         mostra il risultato parziale.
                                                                                                       Notare che le operazioni vengono ese-
                                                                                                    guite nell'ordine in cui sono scritte;
  0200 =38 A2 03 85 15 F5 12 95 OF CA DO F7 60 A9 00 06                                             quindi la scrittura matematica esatta sa-
  0210 =13 69 00 46 13 06 16 69 00 46 16 85 1C 60 D8 20                                             rebbe:
  oe20 =OD 02 20 00 02 90 02 38 60 AO 18 18 A2 06 36 15                                                        (8 + 9) : 2 X l 0 = 80
  0230 =CA DO FB 20 00 02 90 10 AZ. 03 85 OF 95 15 CA DO                                               Per eseguire un nuovo conto bisogna
  0240 =F9 A9 01 18 65 18 85 18 88 DO EO A9 01 C5 19 90                                             prima cancellare il risultato precedente,
  0250 =D8 DO OE A9 86 C5 1A 90 DO DO 06 A9 9F C5 18 90                                             altrimenti il vecchio numero viene sem-
  0260 =C8 06 19 46 1C 66 19 18 60 D8 20 OD 02 A9 18 85                                             plicemente spostato a sinistra.
  OZ.70 =19 A9 00 85 10 85 11 85 12 18 A9 01 24 15 FO 08                                            Esempio:
  0280 =A2 03 85 OF 75 15 95 OF CA DO F7 AO 06 A2 00 76                                             4 x 2 = 8; premendo ora 43 sul display
  0290 =10 E8 88 DO FA C6 19 DO EO A2 03 85 Of' DO 21 CA                                            appare 438.
  02AO =DO F9 A9 01 C5 13 90 18 DO OE A9 86 C5 14 90 10                                                Notare infine che il risultato di una
  0280 =DO 06 A9 9F C5 15 90 08 06 13 46 1C 66 13 18 60                                             divisione è arrotondato per difetto.
  02CO =38 60 85 39 FO 13 18 AO 03 89 35 00 79 32 00 99                                             Esempio:
  02DO =32 00 88 DO F4 C6 39 10 EB 60 86 3C AO 03 86 35                                                   19:5=3                 31:6=5
  02EO =96 38 88 DO F9 AO 09 A2 03 18 8'5 38 75 35 95 35
  02FO =CA DO F7 88 PO F1 A6 3C 60 D8 A9 00 85 33 85 34
  0300 =85 35 85 36 l}5 37 A9 01 85 38 A2 03 85 2F 29 OF                                                Uso della memoria
  0310 =20 C2 02 20 DA 02 85 2F 4A 4A 4A 4A 20 C2 02 20
  0320 =DA 02 CA DO E7 60 F8 A9 00 85 30 85 31 85 32 85                                                    ln generale si utilizza per calcolare
  0330 =36 85 37 A9 01 85 38 A2 03 A9 08 85 39 56 32 90                                                 espressioni con parentesi o nelle quali
  0340 =OF AO 03 18 89 35 00 79 2F 00 99 2F 00 88 DO F4                                                 comunque la precedenza delle operazio-
  0350 =AD 03 89 35 00 79 35 OD 99 35 00 88 DO F4 C6 39                                                 ni non sia la stessa normalmente seguita
                                                                                                        dal calcolatore.

 98
```

## Pagina PDF 99

```text
  Programma

 03b0 =DO DB CA DO D4 60 85 01 10 14 OA 4A 95 01 AO 03 I
                                                                                      ·~
 0370 =E8 85 00 49 FF 95 00 88 DO F6 69 01 95 00 60 D8
 0380 =A2 OF 20 66 03 A2 12 20 66 03 A2 03 18 85 OF 75
 0390 =12 95 15 CA DO F7 70 1F A2 15 20 66 03 A9 7F 25
 03AO =16 C9 10 BO 14 C9 01 DO OE A9 86 C5 17 90 DA DO
 0390 =06 A9 9F C5 18 90 02 18 60 38 60 A2 04 AO 00 94
 03CO =1F CA DO FB A2 06 94 8E CA DO FB 60 85 24 A2 06
 0300 =AO 00 98 84 8E 95 8E CA DO F~ A5 24 85 94 60 AD
 03EO =04 A2 03 18 36 20 CA DO FB 88 DO F5 18 AA 65 23
 03FO =85 23 8A 60 E6 20 20 1F 06 60 EA EA 00 FE 6F F5
 0400 =84 24 A2 03 85 20 95 2F CA DO F9 20 F9 02 06 33
 0410 =66 20 66 33 A4 24 A2 03 85 32 99 00 00 88 CA DO
 0420 =F7 60 A2 03 89 00 00 95 32 88 CA DO F7 06 33 26
 0430 =20 46 33 20 26 03 A2 03 85 2F 95 20 CA DO F9 60
 0440 =A9 00 85 8F A9 F9 85 90 A9 50 85 91 85 92 85 94
 0450 =A9 DC 85 93 60 EA EA EA A5 1F FO 4F C9 OE DO oc
 0460 =AO 18 20 00 04 20 69 02 AO 15 DO 2A C9 OF DO 15
 0470 =4C 44 06 AO 15 06 19 66 16 46 19 20 00 04 20 1E
 0480 =02 AD 18 DO 11 AO 15 C9 OD DO 03 20 F4 03 20 00
 0490 =04 20 7F 03 AO 18 90 05 ~O 2F 06 po 06 20 22 04
 04AO =20 59 06 A9 00 85 1F A9 06 85 1E 60 EA EA Ei' A6
 0480 =1F FO 05 48 20 58 04 68 85 1F C9 DE PO 04 AD 15
 04CO =DO 12 C9 OF DO oc AO 18 A9 00 85 16 85 17 85 18
 0400 =FO 02 AO 12 20 00 04 A9 00 85 1E 60 20 95 05 D8
 04EO =EA EA          eo
                  7E FF A9 98 8D 03 FD 20 EB FE DO 05 85
 04FO =10 4C DF 04 A5 1D DO E7 E6 1D EA EA 20 7E FF A9
 0500 =98 8D 03 FD 20 E8 FE FO 07 EA EA 20 7E FF A9 98
 0510 =8D 03 FP 20 EB FE FO C8 20 57 FF C9 15 FO CO A2
 0520 =15 AO FF 88 DO FD CA DO F8 C9 OA 10 1B A6 1E ED !
 0530 =05 FO.AC A6 1E DO 03 20 BB 03 E6 1E 20 DF 03 20
 0540 =35 FF 20 cc 03 4C EO 04 C9 OA DO 06 20 58 04 4C
 0550 =Df 04 C9 08 DO 06 20 95 05 4C DF 04 C9 10 DO 06
 0560 =20 F4 03 4C DF 04 C9 11 DO 06 20 DF 05 4C DF 04
 0570 =C9 12 DO 06 20 E9 05 4C DF 04 C9 13 DO 06 20 F6
 0580 =05 4C DF 04 C9 14 DO 06 20 FA 05 4C DF 04 20 AF
 0590 =04 4C DF 04 EA 20 88 03 84 1E 84 1F A9 8F 85 94
 05AO =60 EA EA EA AO 06 A2 03 85 20 29 OF 20 35 FF 99
 0580 =8E 00 88 CA CA 85 20 4A 4A 4A 4A 20 35 FF 99 8E
 05CO =00 88 CA CA CA DO E1 20 CB 05 60 A2 00 A9 BF ES
 05DO =EO 06 FO OA D5 8E DO 06 AO 00 94 8E FO F1 60 A2
 05EO =04 85 1F 95 24 CA DO F9 60 A2 04 85 f 4 95 1F CA
 05FO =DO F9 20 59· 06 60 AO oc DO 02 AO OE A2 04 85 1F
 0600 ==95 28 CA DO F9 98 20 AF 04 20 E9 05 20 58 04 20
 0610 ==DF 05 A2 04 85 28 95 1F CA DO F9 20 59 06 60 A9
 0620 =01 24 20 DO 05 A9 00 85 8F 60 A9 40 85 8F 60 A9
 0630 =00 85 92 85 93 85 94 A9 DC 85 8F A9 9C 85 90 A9
 0640 =50 85 91 60 A5 23 DO OE A5 22 DO OA A5 21 DO 06
  0650 =20 40 ·04 4C A3 04 4C 73 04 20 A4 05 20 1F 06 60

Esempio:                                         Notare il risultato arrotondato della
per calcolare:                                 divisione. Per azzerare la memoria è
  4 + (8 X 2)                                  sufficiente premere i due tasti: \CL I \SM I
                               + 15 + 4 = 22
  (-7 + 4) X (-9 + 11)
premere i tasti: con sequenza da sinistra      Segnalazioni di errore
a destra
-7                                                Se il risultato dcll"operazione è troppo
        +.'-                            SM
                                               grande per essere contenuto sul display,
CL                               -1    r-J~
                                               si vede la scritta OVR (overflow). Se l'o-
                                  X
                                               perazione eseguita è matematicamente
                                               scorretta si vede la scritta ERROR. Pre-
'+                                             mere sempre [ç!J dopo ogni errore.
                                               Notare che le operazioni sulla memoria
+'-              SL        I           AM
                                               non danno segnalazioni di errore e
CL               AM    RM                      quindi bisogna usare unà certa cautela.

                                                                                              99
```

## Pagina PDF 100

```text
                                       Operazioni aritmetico-logiche




                                               L   Programma

                                               Oé~OO   =:A9 73 85       8F AC,' 31 85 90 A9         3F 85 9 ·1 85 94 ACJ ~n
                                               02-10   ::85 92 A9       78 8~> 93 20 50 FF          20 7E FF 20 DA FF é~O
                                               0220    ::57 FF CC,'     14 DO FO A5 FA 45           FB 85 FB A9 7c:l 85 8F
                                               0230    :::85 91 Ac:J    60 8~ 90 A9 3D 85           92 A9 3E 85 93 A9 3()
                                               02't0   ::85 94 20       DB 03 A2 94 A9 00           95 OD CA DO FB N._) FA
                                               0250    =:29 OF C<7'     05 30 03 'tA -10 .Fc;•      C9 00 FU 24 Cl) () ·1 F Cl
                                               0260    =37 C9 O'",c..   FO 4E C'1' 03 FO 6 c....,   A9 7B 85 8F A9 3F 85
                                               0270    :::90 A9 3 ·1    85 91 20 DB 03 AS           FB lt~> FA 85 DA 'tC DC
                                               0280    ::02 A9 5F       85 8F A9 SE 85 90           85 9 ·1 20 DB 03 AS FB
   Il programma parte dalla locazione          0290    :: 18 65 FA      85 DA 4C DC O'", c.. A9     60 85 BF A9 3F 85 90
0200 e rimane in attesa con la scritta         02AO    ==A9 78 85       91 85 92 20 DB 03           A5   FB 38 ES             FA 85 DA
"PRONTO". Premendo REG si ha l'in-             02E:O   ==4C DC 02       A9 SF 85 8F A9 3·7          85   90 A9 SE             85 9 ·1   2()
vito a fare una operazione "ESEGUI":
                                               02CO    ==DB 03 A5       FA 25 FB 85 DA 4C           DC   or')c.. At;' :'.lF   85 8F     A9
"add", ·'sott", "and", "or", "eor" fra                 ::3 ·1 85 90
                                               0200                     20 DB 03 A5 FA o~,          FB   85 DA ACJ            DO 85     O~\
due numeri esadecimali di due cifre cia-
                                               02EO    ::8~>   F9 E6    06 DO 02 E6 0·1 AS          07   C'1' 3C DO           06 20     E3
scuno (display 1-2 e 3-4 da sinistra); se
si scrive il risultato (due cifre) sulla ta-   02FO    ::Q3 4C 2C       02 20 oc FF DO 04           85   03 FO ES             AS 03     DCI
stiera esso compare sui display 5 e 6. Se
                                               0300 =EO E6 03           20 DA F E: 20 57 FF         C9   -1'1 "10 05          C9 rn     DO
                                               0310 :::05 E6 07         20 DB 03 FO C7 E6           05   A'",
                                                                                                           c.. 04 06          F9 CA     DO
non è quello richiesto il programma ri-
sponde "errato", invita a riprovare con        0320 =:FB 05 F9          85 FC,' A5 05 C9 02         DO   87 AS FCJ            es DA     FO
"ripeti" e ripropone la stessa operazione      0330 =:2 ·1 A9 .78       8:· 8F A9 3 ·1 8~> 90       85   9·1 A9 SF            a:, 9'c.. A9
come prima. Per rivedere di che opera-         0340 ::78 8~, 93         A9 3F 8~> 94 20 DB          03   2()   E3 O"•
                                                                                                                   ...")      Eb 07 4C
zione si tratta basta premere il pulsante      0350 =:2C 02 A9          7B 85 8F A9 60 85           90   A9 5F        8~>     91 A9 78
AD. Se il risultato è corretto si ha im-       0360 =85 92 8~>          93 A9 3F 85 94 20           DB   03    A9     OD      8~> 93 85
mediatamente la conferma "esatto" cui          0370 =94 A5 07           C9 OB 30 ·12 C9 ·15         30   24    C9     24·     30 34 C9
segùe una valutazione: "lode", "bene",         0380 =33 30 44           20 E3 03 4C 2C 02           A9   38    85     8F      A9 3F 85
"suff', "poco" in base al tempo impie-         0390 ::90 A9 SE          85 9·1 A9 78 85 92          ED   DB    03     4C      00 DE A9
gato. Il programma passa quindi di nuo-        03AO =7C 85 8F           A9 78 85 90 85 92           A9   37    85     9 ·1    20 DB 0:3
vò in attesa con "PRONTO".                     0380 ::4C 00 02          A9 60 8~> 8F A9 3E          85   90    A9     71      8~> 9 ·1 85
   Se si indugia più di 50 secondi e in        03CO ::92 20 DB          03 4C 00 02 A9 73           85   8F    AC)    3F      85 90 85
 ogni caso dopo un miputo buono il pro-        0300 ::92 A9 39          85 9 ·1 20 DB 03 4C         DO   02    20     7E      FF Eb 08
 gramma ripropone pazientemente la             03EO =:DO FC71 60        A9 31 s:, 8F A9 30          85   90    85     94.     A9 73 85
 stessa operazione di prima.                   03FO =9·1 A9 7B          85 92 A9 78 85 93           20   DB    03     DO      FE 6F FS
    Impossibile non imparare!

100
```

## Pagina PDF 101

```text
                                      Traduzione da notazione binaria
                                      in esadecimale e viceversa




                                             Programma


                                             0200 =:A9 78 85     8F ACJ 3·1 85 90 A9 ~)F 8~> C/ ·1 (.\'i' ~>[ 8~> 92~
                                             0210 ::::A9 06 8:>  93 A9 37 85 94 20 7E FF Eb Oli· PO Dli FE
  Il programma parte dalla locazione         0220 :::20 5·7 FF   C9 DE FO 06 cc:;· OD FO 6F DO rn é'.O é)C u:i
moo e scrive sul display "trad in".          Oé'.30 =A9 7B 8~>   8F A9 6D 85 9() AS' ~>F a:. 9 ·1 A9 5F 8'.':> '7'2
   Premendo il tasto O compare la scrit-     OE4·0 =:EQ ·1A 03   20 2C 03 A2 O'")                 c . 8~> 0.3 46 Dc~
                                                                                 ..:• A~> 04 8~1 O"'
ta "dual'', seguita da una cifra esadeci-    0250 ::90 09 A9     06 95 8F CA 10 FS 30 04 AtJ 3F 90 FS PO
male da tradurre in binario con le cifre     0260 =7E FF E6      04 20 DA FE 20 57 FF C9 '10 '10 F ·1 Bi.::_,> 05
                                                                                                               r

O e 1 soltanto, che si scrivono da sini-     0270 =:A8 B9 E:A    FF 85 94 2() ·1 A 03 A~> 03 29 OF es 05 FO
stra a destra. Se la combinazione duale      0280 ::06 A9 00     85 94 FO DB A9 00 85 8F B~· 90 A9 6[) 8:>
è errata il programma la rifiuta (si spen-   0290 :: e;· ·1 A9 32B~· 92 20 1A 03 FO A9 20 PC o:~ A9 SE 85
gono i 4 bit); se è esatta appare la con-    Oc~AO ===8F A9 3E   85 90 A9 5F 85 9 ·1 AS1 38 85 92 20 ·1A 03
ferma "SÌ" sul display-dati e segue          02BO =20 22 03      A5 04 29 OF 85 05 AB 89 EA FF 85 94 A9
quindi un'altra cifra esadecimale.
                                             02CO ==00 85 02     85 06 2() 7E FF E6 04 20 20 FF DO 04 85
   Se si preme invece il tasto E compare
                                             02DO =-~07 FO F2    A~· 07 DO EE E6 07 20 DA FE 20 ~·7 FF C9
la scritta "esad" seguita da una stringa
                                             02EO =02 10      E2 AB 06 02 05 02 B~· 02 98 DO 04 A'J 3F DCJ
di 4 bit da tradurre in cifra esadecimale.
Se la cifra scritta è errata il programma
                                             02FO ==02 A9     06 A6 06 95 8F E6 06 A5 06 cc.;' 04 DO Cb 20
la rifiuta spegnendola; se è esatta appare   0300 ::: 1A 03   AS 05 es 02 FO 05 20 21")    c. 03 DO 82 A9 6D 85
la conferma "SÌ" sul display-indirizzi e     0310 =93 A9      32 85 94 20 1A 03 FO 96 20 7E FF E6 01 DCI
segue quindi un'altra combinazione           0320 =F9 60      A2 04 A9 00 95 BF CA 10 FB 60 A2 05 DO FLt
duale.                                                                                                                    I

                                                                                                                    101
```

## Pagina PDF 102

```text
                                 ~-~~~--A_s_te_r_o_id_i~~~--~




                                            Programma
                                            0200 =A9 00 85 F9 85 FA 85 FB A2 06 BD CE 02 95 E2 CA
                                            0210 ==10 F8 A5 ES 49 FF 85 E8 A2 05 20 48 02 20 97 02
                                            0220 =CA DO F7 20 DA FE 20 57 FF C9 15 10 E5 C9 00 FO
                                            0230 :::·06 C9 03 FO OA DO DB 06 E7 A9 40 C5 E7 DO D3 46
                                            0240 =E7 DO CF 38 26 E7 DO CA A9 89 8D 03 FD A9 09 80
                                            0250 =01 FD A9 20 85 EO AO 02 A9 00 85 E1 .81 E2 25 EO
                                            0260 =FO 07 A5 E1 19 E4 00 85 E1 88 10 FO A5 E1 C4 ES
   Mentre il giocatore sta pilotando la     0270 =DO 08 A4 EO C4 E7 DO 02 09 08 8D 00 FD 20 08 03
sua astronave incontra una cortina di
                                            0280 =EA EA EA EA EA EA EA A9 00 80 00 FD EE 01 FD EE
asteroidi. Il pilota può manovrare la
nave premendo il tasto "O" per muove-
                                            0290 =01 FO 46 EO DO CO 60 C6 E9 DO 1A A9 30 85 E9 BA
re a sinistra o il tasto "3" per muovere    02AO =48 A2 FD F8 38 85 FC 69 00 95 FC E8 DO F7 D8 68
a destra. Se l'astronave sarà colpita il    0280 =AA E6 E2 A5 E2 C9 30 FO 09 AO 00 A5 E7 31 E2 DO
display indicherà a quale punto del gio-    02CO· =07 60 A9 DO 85 E2 FO F1 20 oc FF 4C C8 02 05 02
co è avvenuto l'impatto; più alto sarà il   0200 =08 40 01 04 FF 00 00 00 04 00 08 00 06 12 00 11
numero visualizzato maggiore sarà stata     02ED =00 05 DO- 2C 00 16 00 29 00 16 00 28 00 26 00 19
l'abilità del pilota.                       02FO =00 17 00 38 00 2E 00 09 00 18 00 24 00 15 00 39
   Il programma parte dalla locazione       0300 =00 OD 00_21 00 10 00 00 A5 00 85 00 01 EA EA EA
0200.                                       0310 =CE 00 01 DO F5 60

102
```

## Pagina PDF 103

```text
                                  ~-----~2_1__f_ia_m__m_if_e_r_i _______~




  Ci sono 21 fiammiferi. Ogni giocatore
può coglierne, al suo turno, 1 - 2 o 3.      Programma
Chi rimane con l'ultimo fiammifero per-
de. Il giocatore compete con i'AMICO         0200 =A9 00 85 FB A9 21 85 F9 20 oc FF 20 57 FF C9 04
2000 e deve fare la sua mossa per primo.     0210 =10 f 6 C9 00 FO F2 85 FB F8 38 A5 F9 E5 FB 85 F9
L'indirizzo di partenza è fJ2f.0 ed il di-   0220 =20 7E FF DO FB A9 08 85 EE 20 86 02 EA EA EA EA
splay mostra da sinistra le mosse del gio-   0230 =EA 2C 00 Of EA EA A5 EE C6 EE DO ED C6 F9 A5 F9
catore (2 digit) quelle del calcolatore (2   0240 =29 10 4A 4A 4A 18 65 F9 E6 F9 29 03 DO 02 A9 01
digit) ed il totale dei fiammiferi ancora    0250 =AE EA EA EO AD BO 02 A9 02 85 FA A5 F9 38 E5 FA
in gioco (2 digit). Le mosse devono esse-    0260 =85 F9 C9 01 FO 04 30 10 BO 9E A9 DE 85 FB A9 AD
re impostate da tastiera (tasti 1-2-3)       0270· =85 FA 20 oc FF 18 90 FA A9 5A 85 FB A9 FE 85 FA
dopo qualche secondo anche i'AMICO           0280 •A9 00 85 F9 FO EC A9 60 8D 00 01 20 oc FF CE 00
2000 farà il suo gioco. Il display mostra    0290 =01 DO F8 60
la parola "DEAD" (perso) in caso di
sconfitta "SAFE" per la vittoria.                                                                     I




                                                                                                 103
```

## Pagina PDF 104

```text
    L'AMICO 2000 usa per questo gioco           superare il 21 danno automaticamente         sconfitta. In caso di parità l'ammontare
un "vero" mazzo di carte. Questo signi-         la vittoria. Diversamente vince il pun-      dei gettoni non cambia.
fica che dopo l'uscita di quattro assi          teggio che più si avvicina al 21. Il valo-     Per avere buone possibilità di vittoria
questa carta non comparirà fino alla            re della puntata fatta all'inizio della      è utile tenere a mente quanti assi o fi-
successiva "mischiata" del mazzo. Il            mano sarà sommata agli altri gettoni in      gure sono stati estratti dal mazzo con il
gioco parte dalla loc. 0200 e per circa 2       caso di vincita o sotratta in caso di        auale state giocando.
secondi il display mostrerà la parola
"carte" questo indica che i'AMICO
2000 ha mischiato il mazzo; ora il di-
splay mostra la parola "PUN" (puntata)              Programma
seguita da un punto di domanda (?) ciò
significa che il computer vi chiede quan-           0200     =:A2 33 8A 9~> 1,0 CA 10 FA A2 02 BD BB 03 95 75 CA
to volete puntare.                                  021 ()   == 10 F8 2() EC 03 85 80 D8 A6 76 ED 09 BO 34 AD DB
    Inizialmente disporrete di 20 gettoni           0220     =:20 57 03 AD 33 84 76 20 30 03 38 A5 81 65 82 65
così il display indicherà "Pun? 20". Ora            02:-m =:85  85 BO AE 04 85 80 95 81 CA 10 F9 29 3F C9 34
potete fare la vostra giocata che non do-           021~0 :::BO E' e, AA 89 40 DO 48 85 40 99 40 OD 68 95 40 88
vrà superare i 9 gettoni (il computer               025() :: 10 D5 AO DE 20 57 03 A5 77 20 A6 03 20 30 03 C9
ignora l'impostazione dello O). Dopo                0260 ::OA   BO F9 AA 86 79 CA 30 F3 E4 77 BO EF A2 OB A9
aver effettuata la puntata i'AMICO                  0270 ==00   95 90 CA 10 FB 20 78 03 20 8F 03 20 78 03 20
2000 mostra a sinistra del display le due           0280 ::64   03 86 7A 20 28 03 20 30 03 AA CA 30 ·11 E4 96
carte del giocatore, e a destra, una delle          Oc~90 ==DO F5 20 78 03 C9 22. BO 40 ED 05 FO 53 DO E8 A5
sue, l'altra carta dell'AMICO 2000 è                02AO =:CJ5 48 A2 00 20 OF 03 A2 04 A9 00 95 90 CA "10 FB
"coperta" quindi non compare, questa                0280 :::68 85 9~> A6 7A 20 60 03 20 92 03 20 28 03 A5 9A
diventerà trasparente quando sarà il suo            02CO =C9 22 BO 29 65 9B A6 91 DO ·18 CC) 22 90 02 AS 9A
turno di gioco.                                     02DD :::C9 '17 BO 2C 20 8F 03 DO E2 20 28 03 20 5~> 03 20
    Lo scopo del gioco è quello di avvici-          D2EO :::28 03 A~> 77 F8 38 E5 79 85 77 4C 17 02 20 55 03
narsi il più possibile al 21 considerando           02FO :::2() 28 03 A~, 77 F8 18 65 79 AO 99 90 01 98,DO E8
che le figure indicate con una "F" val-             0300 =:A2 03 20 OF O"'• AS 9A es 97 FO DF BO D5 90 E4 85
gono IO e gli assi indicati con la "A"              0310 ::97 F8 ·1 B 75 98  '"""
                                                                                  C9 22 BO 02 95 9·7 D8 B~> 97 i,s AD
possono valere I oppure 11. Le altre
                                                    0320 =E2 20 57 03 68 é~O A6 03 AO 80 20 30 03 88 DO FA
carte hanno il proprio valore quindi il 6
·,raie 6 il 4 vale 4 e così via.
                                                    0330 =84 89 AO 13 A2 05 A9 89 80 03 FD 85 90 8D OD FD
     l\~r avere la terza carta premere sulla
                                                    0340 ==8C 01 FD E6 78 DO FC 88 88 CA 10 EF 20 DA FE 20
 tastiera il "3" per la carta il "4" e via di       0350 ==57 FF A4 89.60 AO E6 84 74 AD O~> 81 74 99 90 OD
 seguito. Quando il giocatore riterrà di            0360 ::88 10 F8 60 A6 76 C6 76 85 1,0 i,A 4A AA "18 DO 01
 non dover chiedere altre carte do-                 0370 ==38 BD BE 03 BC C8 03 60 20 64 03 E6 96 A6 96 94
 vrà premere lo "O" i'AMICO 2000 ri-                0380 =:8F AD 10 90 02 84 98 ·18 F8 65 97 85 97 D8 60 20
 porterà sul display la scritta "TOT-               0390 ==64 03 C6 99 A6 99 94 96 AO 10 90 02 84 98 18 F8
 XX" dove le XX indicheranno la som-                03AO ==65 9A 85 9A D8 60 48 ltA 4A 4A 4A AB 89 EA FF 85
 ma dei valori delle carte. A propria vol-          0380 ==94 68 29 OF A8 89 EA FF 85 95 60 03 00 20 01 02
 ta i'AMICO 2000 giocherà cercando di               03CO =03 04 05 06 07 08 09 10 10 10 10 F7 DB CF E6 ED
 battervi. Se il giocatore (o I' AMICO              0300 =:FD 87 FF EF F1 F ·1 F1 F1 89 F7 DO F8 F9 CO F3 9C
 2000) supera il 21 il display mostrerà la          03EO =04 03 F8 DC F8 CO ED FC F7 88 88 F7 38 A5 92 65
 parola "SBALLA" e la mano sarà auto-               03FO =95 65 96 85 9 ·1 A2 04 85 91 95 92 CA 00 FE 6F F5
  maticamente vinta dal computer (o dal             0400 =00 60
  giocatore). Cinque carte chiamate senza       I

104
```

## Pagina PDF 105

```text
                                 ~~-------'-'_1a_b_i r_i_nt_o________~




   L'AMICO 2000 crea un labirinto dal        Programma
quale il giocatore deve uscire.
   Il giocatore è presentato, sul display,   0200     :::E6 DO 2() EB FE DO F9 A2 D7 26 DO 90 17 BC D8 03
da un segmento centrale che lampeggia.       02"10    =:BD '10 D3 5CJ DE 02 99 DE 02 CB CB BD "18 03 59 DE
Per muoversi il giocatore utilizzerà i ta-   0220     :::()2 9C,\ DE 02 CA '10 E·.-1
                                                                                . c.. A2 02 08 30 D4 BD DB O'"•
                                                                                                             c.. 95
sti nel seguente ordine:                     0230     :::[)2 CA "10 F8   AD OB   B ·1 D2 99    08 DO 88     rn F8 A2 DA
                                             0240     =:A4 D4 AC,\ FF    38 36   or:,\ 36 D8   2.A 88 DO    F7 29 07 A8
TASTO 9 = in alto                            02~1()   :::89 C6 02 95     DB CA   CA 10 E7      C6 D5 rn     DA A9 05 85
TASTO 1 = in basso
TASTO 4 = a sinistra
                                             Oé~60    =:DS A5 DE 49      40 85   DE A9 89      BD 03 FD     AO 0'71 A2 OA
                                             0270 :::E::~1 D8 BD DO      FD 8C   01 FD C6      D6 DO FC     C8 CB CA CA
TASTO 6 = a destra
                                             OPBD ::: 10 EE 20 DA        FE 20   57 FF C5      D7 F'O CD    8~· D7 A2 o4
   Attenzione che il computer non spo-       02.90 =:DD CE ()2 FO        D5 CA   rn F8 30      BC CA 30     BD BC 03 02
sterà dal centro il segmento che rappre-     02AO :::B9 D8 00 3D         D7 02   DO B1 CA      "10 04 Cb    04· DO 85 DO
senta il giocatore. Ma sposterà tutto il     02BD :::()4 E6 04 DO        F8 CA   DO 06 C6      D'"•
                                                                                                 c. C6 02   DD EF Eb 02
labirinto del quale se ne vedrà di volta     02CO :::E.'6 02 DO E9 FD       F'"I
                                                                              c.. DO 08 40     48 01 09     41 49 13 09
in volta solo una parte.                     0200 :::Q ·1 06 04· 06 06      04 08 01      08   40 40 DA     02 08 FF FF
   Quando sul display resterà solo il seg-   02EO =04 00 F5 7F 15           ()0 4 ·1 FE   5F   04 51 70     50 04 C1 86
mento che lampeggia, senza altro intor-      02FO =15 14 Tl D5 14           54 70 5E      05   00 FD FF     00 00 00 00
no significa che il giocatore è uscito dal   0300 :::QQ DO DO 00 OD         00 00 00      05   OB 10 10     ·14 '18 "17 10
labirinto. Il programma parte da 0200 -      o~no =01 04 80 10 80           02 40 40      02   02 40 01     rn 04 80 Hl
RUN per un altro labirinto.

                                                                                                                        105
```

## Pagina PDF 106

```text
                                   ~~------~D_u_e_s_e_tt_e______~-~




   Scopo del gioco è stimolare la cono-         introdotta modifica il byte già presente      Tener presente la possibilità di vitto-
scenz(.l. delle tecniche di presentazione su    nella locazione 0094 con l'istruzione      ria anche quando si raggiunge una con-
display a 7 segmenti oltre che della no-        ASL e vi si sovrappone con l'istruzione    figurazione uguale a quella del primo
tazione binaria ed esadecimale.                 ORA.                                       display a sinistra (settematto). Anche in
   Il programma è rilocabile. Parte dalla         Se un giocatore, studiando bene la si-   questo caso il programma scrive "bene"
prima istruzione presentando un rime-           tuazione prevede di non poter vincere in   indicando due configurazioni diverse.
scolamento di segmenti su tutti i di-           quattro mosse può· sempre peggiorare le       Per ricominciare una nuova partta
splay.                                          cose per l'avversario.                     premere RUN per mezzo secondo.
   Premendo REG restano fissate due
configurazioni diverse sui due display-
dati.                                            Programma
   Il gioco consiste nell'introdurre delle
cifre sulla tastiera esadecimale fino a          0200    =:A9 OA 85 00       E6    04 20 7E FF      Ab 00 F6 BE CA 86 00
che la configurazione di destra risulti          0210    =:DO F2 DB 20       DA    FE 20 57 FF      C9 14 FO O'"•
                                                                                                               c.. DO E ·1 A5
uguale a quella di sinistra che fa da mo-        0220    ::04 85 93 49       55    85 94 A2 03      A9 00 95 8F CA 10 FB
dello~ Avvenuto ciò il programma scrive          0230    =:A9 03 85 05       20    7E FF 20 2D      FF DO 04 .85 03 FO F4
"bene" e sottolinea lampeggiando l'u-            0240    =A5  03 DO FO       E6    03 20 DA FE      20 57 FF C9 10 10 E4
guaglianza raggiunta.                            0250    ::Q6 94 05 94       85    94 A5 94 OA      85   01   A5   93   DA C5 01
   Ogni giocatore dispone di 4 mosse             0260    =FO 10 A6 05        F6    8F A5 o ·t C5    8F   FO   06   C6 05 10 C4
 controllate dall'accensione di un seg-          0270    =:30 BE 20 DA       FE:   20 57 FF C9      13   FO   84   20 7E FF E6
 mento sugli altri display. Premendo a           0280    =:04 DO F9 A2       7C    86 8F CA 86      90   86   92   A9 37 85 91
 caso i tasti esadecimali e ben difficile in-    0290    =9A CA DO FD        E6    04 DO FC BA      CA   DO   F4   FO D4
 dovinare. Tener presente che ogni cifra

106
```

## Pagina PDF 107

```text
                                  ~---~-c_a_c_c_ia__a_l__nu_m__e_r_o_____~




   Il programma parte dalla I a istruzione    si accompagna serve ora d1 localizzazio-     che non ama rimanere a lungo nello
ed è rilocabile. Premendo REG, dopo il        ne, come all'inizio.                         stesso buco.
 RUN, il display presenta ritmicamente            Un cambiamento di nascondiglio può          Il gioco richiede molta pazienza e per-
serie dei segmenti orrizzontali inferiori e   avvenire anche all'atto di scrivere una      spicacia, ma grande è la soddisfazione
in alternanza genera un segnale in uscita     singola cifra, se si verificano certe con-   che si prova udendone gli schiamazzi,
il cui periodo è proporzionale a un nu-       dizioni imprevedibili e persino mentre si    quando si riesce a inchiodare la preda
mero esadecimale di due cifre che rap-        è ... in agguato, trattandosi di una preda   nel suo nascondiglio!
presenta il "nascondiglio".
   Un semplice altoparlante collegato un
capo a massa e uno ai piedini della por-
ta C permette di avvertire una nota rit-
                                               Programma
mica, che varia di potenza col numero
dei piedini collegati in parallelo.
   Si cerca ora di indovinare il numero        0200    =E6    F9   E6   FA E6 FB     20 oc FF      E6   04   20 DA    FE   20
                                                                                                                            57
predetto introducendolo dalla tastiera.        0210    =FF    C9   14   FO 02 DO     E9 A9 7F      85   08   A2 05    A9   08
                                                                                                                            95
Quando le due cifre risultano scritte sul      0220    =8F    CA   10   FB A5 04     8~ 07 85      03   A9   00 85    06   E6
                                                                                                                            04
display-dati ne deriva un segnale acusti-      0230    =20    7E   FF   E6 01 DO     F9 A9 92      8D   03   FD AO    FF   A6
                                                                                                                            03
co di frequenza tanto più alta quanto          0240    =8C    02   FD   CA DO FD     C8 FO F5      E6   01   DO EF    20   DA
                                                                                                                            FE
più piccola è la distanza assoluta dal         0250    =20    57   FF   C9 10 10     07 AA 45      04   FO   88 DO    DA   A5
                                                                                                                            04
numero-nascondiglio. Ciò rende possibi-        0260    =29    2F   29   2F FO 81     DO C6 8A      A2   04   06 F9    CA   DO
                                                                                                                            FB
le la sua localizzazione.                      0270    =05    F9   85   F9 29 OF     A8 89 EA      FF   A6   06 95    93   A9
                                                                                                                            01
   Durante l'avvicinamento però, ogni          0280    =C5    06   FO   06 E6 06     DO A6 DO      9E   A5   F9 38    ES 01 Ftl
passo che non sia più breve del prece-         0290    =1F    10   05   49 FF 18     69 01 AA      38   E5   03 10    05 49 FF
dente provoca la "fuga" della preda ver-       02AO    =18    69   01   es 08 10     os 8S 08      8A   DO   DC .A9   00 FO 84
so un altro nascondiglio, generalmente         0280    =A9    92   8D   03 FD AD     FF A6 00      8C   02   FD CA    DO FD ca
più in basso nella pagina. Questo fatto è      02CO    =FO    F5   E6   00 DO EF     A9 10 85      01   20   7E FF    C6 01 DO
segnalato dalla scomparsa delle cifre sul      0200    =F9    FO   nn
display e il nuovo segnale acustico che

                                                                                                                                 107
```

## Pagina PDF 108

```text
                                   (..__ _A
                                          _tt
                                            _e_
                                              rr_a_g_gi_o_ iu_n_a_r_e____)




Il    programma   inizia dalla locazione       Suggerimenti per un atterraggio sicuro              piedi premi il tasto "9" per ridurre la
moo.                                                                                               velocità di discesa.
    Alla partenza ti trovi a 4500 piedi di     - Per conservare il carburante inizial-           - Quando la velocità sarà scesa al valo-
altezza e stai scendendo. La discesa del-        mente premi "I", scenderai molto ve-              re 15 puoi stabilizzarla premendo il
la tua navicella è provocata dall'attra-         locemente.                                        tasto "5". Poi sta a te proseguire feli-
zione della forza di gravità. Quando           - Quando la velocità sarà di "90" pre-              cemente il volo.
vuoi potrai vedere la quantità di carbu-         mi il tasto "5" per stabilizzare questa         - Dopo aver visualizzato con "C" il
rante premendo il tasto "C" (carburan-           velocità.                                         carburante premere "A" per tornare a
te). Inizialmente disporrai di 800 lt. di      - Quando l'altitudine sarà di circa I 500           visualizzare l'altitudine.
carburante.
    Gli ultimi due display a destra ti mo-
strano la velocità di discesa (o ascesa)        Programma
della tua navicella.
    È possibile regolare la discesa o la        0200 =A2 OD BO cc 02 95 05 CA 10 F8 A2 05 AD 01 F8 18
ascesa agendo sui tasti da "I" a "9" che        0210 =85 D5 75 07 95 05 CA 88 10 F6 85 08 10 02 A9 99
agiscono sulla potenza dei motori.              0220 =75 05 95 05 CA 10 E5 A5 05 10 OD A9 00 85 E2 A2
    ATTENZIONE: premendo il pulsante            0230 =02 95 05 95 08 CÀ 10 F9 38 A5 EO E5 DD es ED A2
"O" i motori si spegneranno e non sarà          0240 =01 85 DE E9 00 95 DE CA 10, F7 BO oc A9 00 A2 03
possibile riaccenderli.                         0250. =95 DD CA 10 FB 20 BD 02 A5 DE A6 DF 09 CO A4 E1
    La potenza dei motori ottenuta con il       0260 =FO 20 FO 9C FO A4 A2 FE AO 5A 18 A5 09 69 05 A5
tasto "I", minimo, è decisamente bassa          0270 =08 69 00 BO 04 A2 AD ÀO DE 98 A4 EZ FO 04 A5 05
per tanto essi consumeranno pochissime          0280 =A6 06 85 FB 86 FA A5 09 A6 08 10 05 38 A9 00 ES
carburante, ma la forza di gravità attire-      0290 =D9 85 F9 A9 02 85 E3 D8 go oc FF 20 57 FF C9 13
rà la tua navicella molto velocemente           02AO =FO CO BO 03 20 AD 02 C6 E3 DO ED FO 87 C9 OA 90
verso la 1una.                                  0280 =05 49 oc 85 E1 60 AA A5 DD FO FA 86 DD A5 DD 38
    La potenza dei motori ottenuta pre-         02CO =F8 E9 05 85 DC A9 00 E9 00 85 DB 60 45 01 00 99
mendo il tasto "9 ", massi mo, è molto          0200 =81 00 99 97 02 08 00 00 01 01
alta consuma molto carburante, ma vin-         ~----------            ---------     ·-··-


ce la forza di gravità e riduce pronta-
mente la velocità di discesa.                                   DISPLAY
    Premendo il pulsante "5" esso contra-
sta esattamente la forza di gravità e con
esso è possibile proseguire la discesa o
l'ascesa a velocità costante.
    Se si termina il carburante i comandi
r~lativi ai motori diverranno inoperati-
v1.                                                                         ALTITUDINE                          VELOCITA'
    Per un atterraggio sicuro la velocità di
discesa dovrà essere di 05 o interiore a
tale valore.
    Dopo l'atterraggio i motori si spegne-
ranno automaticamente e di relativi
controlli diverranno inoperativi, ma
premendo il tasto "C" potrai vedere la
                                                                                                            OD
 ::iuantità dì carburante rimasta.                                         CARBURANTE
    Premere "RU N" per etlettuare un
 nuovo volo.                                            J:'sempio di indica::ioni sul display durante il gioco de/l'atterraggio lunare.

108
```

## Pagina PDF 109

```text
                                    ~~------~-F-ile_t_to~-------~




  Questa è una versione del "filetto"
per l'AMICO 2000, il giocatore gareggia       Programma
con il computer. La matrice del gioco è
quella riportata nella figura a piede pa-
gina.                                         0·100 =:4C 10 03 EA EA EA A9 20 15 BF 95 BF 60 EA EA 08
  Per vincere è necessario, come sem-         0110 ==08 08 40 40 40 01 01 o ·1 o·1 04· 07 o ·1 02 03 o ·1 03
pre, riuscire a posizionare tre segmenti      0120 :::02 05 08 04 05 06 05 05 03 06 09 07 08 09 09 07
in fila, orizzontali, verticali od obliqui.   0·130 ==85 D9 A2 09 A5 D9 35 DB 24 D9 DO 03 CA DO f 5 60
Le mosse dell'AMICO 2000 sono rap-            0"140 =B5 BF DO 02 F6 DB 60 95 BF AD 08 A9 00 99 CB 00
presentate da segmenti lampeggianti,          0150 =:BE 17 01 20 8A 03 BE 1F 01 20 8A 03 BE 27 01 20
quelle del giocatore da segmenti fissi.       0·160 =8A 03 88 DO E6 60
Premendo RUN i computer gioca per             0200 =:A9 00 A2 1D 95 B4 CA DO FB A9 05 8~· BB AO 04 2CI
primo volendo il giocatore la prima           OP·10 =F2 03 A2 04 D5 BB FO F7 CA DO F9 9cl BB DO 88 DO
mossa premerà "1"'. li programma parte        0220 =:E:E E6 86 AO 04 20 F''I
                                                                           c.. 03 A2 05 D5 86 FO F7 CA DO
da f)lffl.                                    0230 =F9 99 86 00 88 DO EE A9 03 AO 08 D9 CB 00 FO 05
   Il computer possiede in questo pro-        0240 =88 DO F8 FO ·15 BE 17 01 20 86 o ·1 BE 1F 01 20 06
gramma un "quoziente d'intelligenza"          0250 =0·1 BE 27 01 20 06 01 4C FE 02 A2 09 A9 CO 35 BF
che inizialmente è del 75% (loc. m11 -        0260 =FO OE CA DO F7 A2 09 20 06 01 CA DO FA 4C ·15 03
OC) che sale se la macchina perde e           0270 ==E6 85 A5 DB DO 17 20 Ab 03 FO FB C9 OA BO F7 AA
scende se vince. Il giocatore può comun-      0280 =B4 BF DO F2 A9 't0 20 47 0·1 E6 DB DO AA 20 4C 03
que, alla fine di ogni gioco, modificarlo     0290 =:E6 D1 DO F9 A9 08 20 CB 03 A9 02 20 CB 03 A9 04
premendo "REG" il display mostra la           02AO =:20 C8 03 A9 01 20 CB 03 A9 CO 20 30 0·1 DO 43 A9
parola "ODDS" seguita dal valore del          0280 ::30 20 30 0·1 DO 3C A9 08 20 30 01 DO 3~1 20 83 03
"Q-1" che il calcolatore ha in quel mo-
                                              02CO =29 OF C5 D2 BO 1F A4 85 CO o ·1 DO 04 29 01 DO ·17
mento : impostare quindi in tastiera il
nuovo valore (00 minimo - OF massimo)
                                              0200 =:CO 04 DO 06 24 C4 30 OD 70 07 A9 02 20 30 0·1 DCI
 e premere "DA" per tornare al gioco.         02EO =11 AO 05 DO 02 AO 09 B6 B6 BS BF FO 05 88 DO F7
                                              02FO =FO F3 A9 80 20 47 01 C6 DB A9 oc 4C 3'71 02 A5 DB
                                              0300 =DO 04 C6 D2 10 OF E6 D2 A9 10 es D2 90 F4 BO 05
                                              0310 =A9 oc 85 02 08 20 Ab 03 AO 01 C9 ·13 FO 28 88 C9
             7       8        9               0320 :: ·12 FO 23 C9 14 DO EE A9 OD 85 FB A9 D5 85 FA A5
                                              0330 =D2 85 F9 20 oc FF 20 EB FE 20 57 FF C9 ·11 FO D5
             4       5        6               0340 =BO E"c .J 85 02 90 E1 84 OB 4C 00 02 EA A9 89 80 03
                                              0350 ::f'D E6 DA AD 00 A2 08 B9 CO 00 85 FC FO •14 29 20
                                              0360 :::f'O 04 24 DA 70 oc A5 FC 29 40 DO DA A5 DA 29 08
              1      2        3               0370 =FO 04 A9 00 FO 03 89 OF 01 84 FC 20 38 FF C8 CO
                                              0380 ::09 FO 06 EO 11 FO CE DO CE 60 85 BF 85 D9 24 D9
                                              0390 =30 06 70 08 A9 00 FO 06 A9 04 DO 02 A9 o ·1 "18 79
                                              03AO =-~CB 00 99 C8 00 60 20 4C 03 20 DA FE FO F8 20 57
                                              0380 ::f'F AA 60 D8 38 A9 D4 65 D7 65 D8 85 D3 A2 04· 85
                                              03CO =D3 95 D4 CA 10 F9 60 EA 85 D9 A2 09 16 DB 16 DB
                                              0300 =CA DO F9 AD 08 A5 D9 D9 C8 00 DO 12 BE 17 01 20
                                              03EO =40 01 BE 1F 01 20 40 01 BE 27 01 20 40 o ·1 88 DO
    Corrispondenza fra tasti e segmenti       03FO =E4 60 20 83 03 29 OE 05 86 FO F7 C9 00 FE 6F FS
     delle cifre nel "gioco del filetto".

                                                                                                           109
```

## Pagina PDF 110

```text
                                    (...____e_a_t_
                                                 ta_g_li_a_n
                                                           _a_v_a_ie_ _____,)




                                             'Programma


                                             0200   =A9 02 85 00 A9 00 85 E8 A2 99 A9 02 95 DO CA DO
                                             0210   =F9 A9 11 85 E7 8S E3 A2 07 18 AO 07 A9 OD 9·1 E7
                                             0220   =:8810 FB F8 A5 E7 69 10 85 E7 CA 10 EC F8 38 A5
                                             0230   =:EA6S ED 6S EE 8S E9 A2 04 BS E9 95 EA CA '10 F9
                                             0240   =:38E9 99 BO E8 A5 EB 29 06 ç9 DO FO 41 C9 02 FO
                                             Oé~~.o ~36 e 9 '04 FO 19 •18 AO 02 A6 E9 B5 00 C9 02 FO B ·1
   L'AMICO 2000 posiziona casualmen-
                                             Oé~60 ::A9 01 95 DO 8A 69 09 AA 88 10 EF 'tC 9S 02 AO 02
te in un quadrato 8x8 quadretti una
nave da 3 quadretti. La nave potrà esse-     0270 ::A6 E9 85 OD C9 02 FO 99 A9 01 9S 00 8A 38 E5 E3
re in posizione orrizzontale, verticale od   0280 =AA 88 10 EE 4C 95 02 A9 '10 8~> E3 4C 6E 02 A9 01
obliqua. Il display mostra da sinistra (2    0290 =8~· E3 4C 6E 02 A9 20 85 FA A9 00 85 F9 85 Eli· 85
digits) le coordinate, il numero dei colpi   OE~AO =FB 85 E6 De· 20 oc FF 20 57 FF C9 OF FO 37 C9 09

ancora disponibili, e quante volte la        02BO ::: 10   F"1 C9 00   FO ED 85 ES A5 E6 C9 o ·1 FO 16 E6 E6
nave è stata colpita. Per ogni battaglia     02CO ==06     E5 06 E5    06 ES 06 E5 A5 ES 85 FB 20 20 FF DO
sono disponibili 20 colpi, se, dopo i        0200 =:f'B    4C A3 02    18 A5 ES   65 FB 8S     FB   C6 E6 20 20 FF
venti colpi la nave non è stata colpita il   Oé~EO =:DO    FB 4C A3    02 AS FB   es E4 FO     07   AA B~· 00 C9 01
computer ne rivela le coordinate. Dopo       02FO =FO      17 F8 AS    FA 38 E9   01 FO 36     85   FA 08 A5 FB 85
l'impostazione delle coordinate premere      0300 =:E4     20 20 F~·   DO FB 4C   A3 02 E6     F9   A5 F9 C9 03 FO
il tasto "F" (fuoco), affondando la nave     0310 ::08     20 20 FF    DO FB 4C   F2 02 F8     A9   21 38 ES FA 85
il display mostra la parola "DEAD" e         0320 =:F9     DB A9 DE    85 FB A9   AD 85 FA     20   oc FF 4C 2A 03
di seguito il numero di col.pi impiegati.    0330 =AD      02 A2 99    85 00 C9   o ·1 FO 06   CA   DO F7 4C 48·03
Per una nuova battaglia AD f,)200 -          0340 =8A      99 F9 DO    88 4C 3A   03 20 oc     FF   4C 48 03
RUN.



                                    12345678                                           FORMATO DISPLAY
                                                I
                                1               I

                                2
                                                I
                                                I
                                                I
                                                            COORDINATE                                   ml r;=;i
                                3               I
                                                I
                                                               64                                        l!d.I l!::!.J
                                4   ·-----------t                         COORDINATE      N° COLPI       COLPI A SEGNO
                                5                                                        DISPONIBILI
Esempio di rappresentazione     6
sul display di una .fase del    7
gioco della battaglia navale.   &..________________,

110
```

## Pagina PDF 111

```text
                                  (~_____s_i_ot__m_a_ch__i_ne______~




   All'inizio del gioco sul display a de-
stra sarà visualizzato il numero "25"             Programma
che rappresenta i gettoni che i'AMICO
2000 ti dà per cominciare a giocare;
premendo un tasto qualsiasi i tre display         0200 =A9 25 85 05 20 BA 02 A9 OD 85 06                  20.8D 02   DO FB
che simulano "le ruote" cambieranno               0210 =E6 09 20 80 02 FO F9 A9 03 85 06                  F8 38 A5   05 E9
velocemente il loro contenuto e, dopo             0220 =01 85 05 20 BA 02 26 09 20 BD 02                  C6 08 DO   F9 A6
qualche secondo si fermeranno, uno per            0230 :::06 A5 09 29 06 09 40 95 01 46 09                46 09 C6   06 DO
volta in successione da sinistra a destra         0240 =:E7 A5 04 C5 03 DO 37 es 02 DO 33                 A2 10 C9   40 FO
formando una combinazione di segni. Se            0250 =OD A2 08 C9 42 FO 07 A2 06 C9 44                  FO 01 CA   86 07
la combinazione è vincente sarà incre-            0260 =A9 80 85 08 20 80 02 C6 08 DO F9                  C6 07 FO   9C 18
mentato il totale dei gettoni.                    0270 =F8 A5 05 69 0·1 BO 94 85 05 20 BA                 02 DO E2   A2 03
   Ad ogni giocata sarà sottratto dal to-         0280 =C9 46 FO DA 20 80 02 A5 05 DO 80                  FO F7 A6   06 10
tale un gettone.                                  0290 =02 F6 02 CA 10 FB A9 89 80 03 FD                             04 85
                                                                                                          AD OA A2
   La combinazione che "paga"meglio è
                                                  02AO =:OO 8C o ·1 FO 80 00 FD D8 A9 89 E9               01 DO FC   80 01
costituita da tre segmenti al centro dei
                                                  0280 =:FD CB CB CA 10 E9 20 20 FF 60 A5                 05 29 OF   AA BD
display in questo caso saranno accredi-
tati 15 gettoni; ci sono, naturalmente,           02CO =EA FF 85 DO A5 05 ltA 4A 4A 4A AA                 BO EA FF   85 01
altre combinazioni che incrementano il            0200 =6CI
totale.
   La massima vincita è rappresentata
da 99 gettoni; se il .giocatore dovesse re-
stare senza gettoni i'AMICO 2000 ... non
fa credito.                                                         Combinazioni vincenti della slot machine




[j]EJ[j]         • 2 GETTONI
                                  E!lGB                .2 GETTONI
                                                                    BJB16J          • 2 GETTONI
                                                                                                    BlBlB        .2 GETTONI




8]EJ2]           • 2GETTONI
                                  BlEJGl               .2 GETTONI
                                                                    BlE'.lE'.1      .2 GETTONI
                                                                                                    BlE15l       .2 GETTONI




0E'.18           • 7 GETTONI       I   lii ,11     11 . 2 GETTONI
                                                                    E!l5JB1         .2 GETTONI
                                                                                                    Bl~B         • 2GETTONI




I 111 !I El .      2 GETTONI       I : 11     I   El   .2 GETTONI   EJ B B          .15 GETTONI
                                                                                                    BlBJG1       .4 GETTONI




                      E se vuoi crescere fino al Personal Computer ....
                                                                                                                             111
```

## Pagina PDF 112

```text

```

## Pagina PDF 113

```text
               CEDOLA PER L'ACQUISTO DI UN MICROCOMPUTER

                                       "AMICO 2000"


(Da spedire in busta chiusa a A.S.EL. s.r.l. Via Cortina D'Ampezzo 17, 20139 MILANO
- Tel. 02-5391719)

Sono interessato ad acquistare:

n. O Microcomputer AMICO 2000/1 K in scatola di montaggio (, 1
(fornito con 1 Kbyte di memoria RAM e interfaccia per registratore a cassette):
Lit. 284.400 (IVA inclusa).

n. O Microcomputer AMICO 2000/2 montato e collaudato 121
(caratteristiche come il precedente): Lit. 348.000 (IVA inclusa).


Prego spedirmi direttamente quanto ordinato (pagherò contrassegno al ricevimento
del pacco) al sottoindicato indirizzo o di segnalarmi il vostro rivenditore più vicino alla
mia città.
ATTENZIONE: la segnalazione avverrà solo se il distributore locale è presente. in ogni altro caso si
procederà all'invio del materiale ordinato con pagamento in contrassegno.


O Sono interessato inoltre a maggiori dettagli sulle schede di espansione del sistema
AMICO 2000.

Scrivere in stampatello e compilare in ogni voce:



NOME ................................. COGNOME ................................................ .

CODICE FISCALE .................................. TELEFONO ........................ ..

VIA ......................................................................... .

C.A.P ..................... CITTA' ...................................................... .

IMPORTANTE: La merce viaggia a rischio e pericolo del Commitente: è possibile assicurarla aggiun-
gendo Lit. 2.000 per ogni 50.000 di valore assicurato.

(1) La scatola di montaggio è coperta da una forma di "funzionamento garantito" per cui in caso di
insuccesso nella realizzazione è possibile inviare la piastra con tutti i componenti al costruttore. che la
sostituirà con una montata e collaudata dietro il pagamento di una quota fissa di Lit. 50.000 qualora il
difetto risieda in un errore di montaggio.

(2) Il microcomputer montato e collaudato è qarantito per 3 mesi.
```

## Pagina PDF 114

```text

```

## Pagina PDF 115

```text

```

## Pagina PDF 116

```text
è un sistema espandibile
Se vuoi approfondire le tue conoscenze nel settore dei computer o se desideri un                  legenda sistema espanso
potente sistema di elaborazione, i'AMiCO 2000 ti aiuta a crescere fino al persona!
computer.
Dalla scheda base puoi arrivare a realizzare un potente sistema di elaborazione                   A Alimentatore di potenza
espandendolo con i moduli aggiuntivi e compatibilmente anche con le tue esigenze di               B Tastiera alfanumerica standard ASCII
ordine economico.                                                                                 C Contenitore metallico per l'intero sistema
L'AMICO 2000 è un sistema professionale: ogni scheda di espansione è realizzata con                 completo di cestello porta schede
i componenti più avanzati su formato normalizzato europeo EUROCARD (160 x 100                     D Unità a floppy disk
mm).                                                                                              E Monitor TV ad alta definizione e linearità
Ogni configurazione intermedia fino alla massima trova posto in un razionale conteni-             F Stampante
tore completo di cestello portaschede e di tastiera alfanumerica.                                 G Registratore a cassette
                                                                                                  1 Interfaccia video
                                                                                                  2 MiniBASIC e BASIC da 8K
                                                                         Display indirizzi-dati
                                                                                                  3 interfaccia per doppio registratore
 CPU 6502 PROM Monitor        Interfaccia I O 8 bit
                                                                                                    a cassette
                                   I
                     PROM Cassette Memoria RAM (2 K)                                              4 Espansione RAM 16K byte
                                                                                                  5 Interfaccia floppy disk
                                                                                                  6 Interfaccia di comunicazione seriale
                                                                                                  7 I/O analogico
                                                                                                  8 I/O digitale
                                                                                                  9 Altre espansioni




                                                                                  I
                                                                         Tasti esadecimali

   Regolatore di tensione                             Tasti funzionali


                                              I
                                              ~




espandibilità del sistema ~~D.2088
```

## Pagina PDF 117

```text

```

