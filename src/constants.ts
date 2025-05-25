const USER = 'me'


interface Assistant {
    id: string
    link: string
    name: string,
    avatar: string,
    desc: string,
    accept: string,
    enable: boolean
}

const ASSISTANTS: Record<string, Assistant> = {
    DEEPSEEK: {
        id: 'deepseek',
        link: 'https://chat.deepseek.com/',
        name: 'DeepSeek',
        avatar: 'deepseek.png',
        desc: 'Chat with DeepSeek AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | 深度求索（DeepSeek）助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。',
        accept: '.epub,.mobi,.azw3,.pdf,.png,.jpg,.jpeg,.svg,.svgz,.bmp,.gif,.webp,.ico,.xbm,.dib,.pjp,.tif,.pjpeg,.avif,.apng,.tiff,.jfif,.txt,.md,.csv,.tsv,.html,.json,.log,.dot,.go,.h,.c,.cpp,.cxx,.cc,.cs,.java,.js,.css,.jsp,.php,.py,.py3,.asp,.yaml,.yml,.ini,.conf,.ts,.tsx,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.abap,.asc,.ash,.ampl,.mod,.g4,.apib,.apl,.dyalog,.asax,.ascx,.ashx,.asmx,.aspx,.axd,.dats,.hats,.sats,.as,.adb,.ada,.ads,.agda,.als,.apacheconf,.vhost,.cls,.applescript,.scpt,.arc,.ino,.asciidoc,.adoc,.aj,.asm,.a51,.inc,.nasm,.aug,.ahk,.ahkl,.au3,.awk,.auk,.gawk,.mawk,.nawk,.bat,.cmd,.befunge,.bison,.bb,.decls,.bmx,.bsv,.boo,.b,.bf,.brs,.bro,.cats,.idc,.w,.cake,.cshtml,.csx,.c++,.cp,.h++,.hh,.hpp,.hxx,.inl,.ipp,.tcc,.tpp,.c-objdump,.chs,.clp,.cmake,.in,.cob,.cbl,.ccp,.cobol,.cpy,.capnp,.mss,.ceylon,.chpl,.ch,.ck,.cirru,.clw,.icl,.dcl,.click,.clj,.boot,.cl2,.cljc,.cljs,.hl,.cljscm,.cljx,.hic,.coffee,._coffee,.cjsx,.cson,.iced,.cfm,.cfml,.cfc,.lisp,.asd,.cl,.l,.lsp,.ny,.podsl,.sexp,.cps,.coq,.v,.cppobjdump,.c++-objdump,.c++objdump,.cpp-objdump,.cxx-objdump,.creole,.cr,.feature,.cu,.cuh,.cy,.pyx,.pxd,.pxi,.d,.di,.d-objdump,.com,.dm,.zone,.arpa,.darcspatch,.dpatch,.dart,.diff,.patch,.dockerfile,.djs,.dylan,.dyl,.intr,.lid,.E,.ecl,.eclxml,.sch,.brd,.epj,.e,.ex,.exs,.elm,.el,.emacs,.desktop,.em,.emberscript,.erl,.es,.escript,.hrl,.xrl,.yrl,.fs,.fsi,.fsx,.fx,.flux,.f90,.f,.f03,.f08,.f77,.f95,.for,.fpp,.factor,.fy,.fancypack,.fan,.fth,.4th,.forth,.fr,.frt,.ftl,.g,.gco,.gcode,.gms,.gap,.gd,.gi,.tst,.s,.ms,.glsl,.fp,.frag,.frg,.fsh,.fshader,.geo,.geom,.glslv,.gshader,.shader,.vert,.vrx,.vsh,.vshader,.gml,.kid,.ebuild,.eclass,.po,.pot,.glf,.gp,.gnu,.gnuplot,.plot,.plt,.golo,.gs,.gst,.gsx,.vark,.grace,.gradle,.gf,.graphql,.gv,.man,.1in,.1m,.1x,.3in,.3m,.3qt,.3x,.me,.n,.rno,.roff,.groovy,.grt,.gtpl,.gvy,.gsp,.hcl,.tf,.hlsl,.fxh,.hlsli,.htm,.st,.xht,.xhtml,.mustache,.jinja,.eex,.erb,.deface,.phtml,.http,.haml,.handlebars,.hbs,.hb,.hs,.hsc,.hx,.hxsl,.hy,.pro,.dlm,.ipf,.cfg,.prefs,.properties,.irclog,.weechatlog,.idr,.lidr,.ni,.i7x,.iss,.io,.ik,.thy,.ijs,.flex,.jflex,.geojson,.lock,.topojson,.json5,.jsonld,.jq,.jsx,.jade,.j,._js,.bones,.es6,.jake,.jsb,.jscad,.jsfl,.jsm,.jss,.njs,.pac,.sjs,.ssjs,.sublime-build,.sublime-commands,.sublime-completions,.sublime-keymap,.sublime-macro,.sublime-menu,.sublime-mousemap,.sublime-project,.sublime-settings,.sublime-theme,.sublime-workspace,.sublime_metrics,.sublime_session,.xsjs,.xsjslib,.jl,.ipynb,.krl,.kicad_pcb,.kit,.kt,.ktm,.kts,.lfe,.ll,.lol,.lsl,.lslp,.lvproj,.lasso,.las,.lasso8,.lasso9,.ldml,.latte,.lean,.hlean,.less,.lex,.ly,.ily,.m,.ld,.lds,.liquid,.lagda,.litcoffee,.lhs,.ls,._ls,.xm,.x,.xi,.lgt,.logtalk,.lookml,.lua,.fcgi,.nse,.pd_lua,.rbxs,.wlua,.mumps,.m4,.mcr,.mtml,.muf,.mak,.mk,.mkfile,.mako,.mao,.markdown,.mkd,.mkdn,.mkdown,.ron,.mask,.mathematica,.cdf,.ma,.map,.mt,.nb,.nbp,.wl,.wlt,.matlab,.maxpat,.maxhelp,.maxproj,.mxt,.pat,.mediawiki,.wiki,.moo,.metal,.minid,.druby,.duby,.mir,.mirah,.mo,.mms,.mmk,.monkey,.moon,.myt,.ncl,.nl,.nsi,.nsh,.axs,.axi,.nlogo,.nginxconf,.nim,.nimrod,.ninja,.nit,.nix,.nu,.numpy,.numpyw,.numsc,.ml,.eliom,.eliomi,.ml4,.mli,.mll,.mly,.objdump,.mm,.sj,.omgrofl,.opa,.opal,.opencl,.p,.scad,.org,.ox,.oxh,.oxo,.oxygene,.oz,.pwn,.aw,.ctp,.php3,.php4,.php5,.php6,.php7,.php8,.phps,.phpt,.pls,.pck,.pkb,.pks,.plb,.plsql,.sql,.pov,.pan,.psc,.parrot,.pasm,.pir,.pas,.dfm,.dpr,.lpr,.pp,.pl,.al,.cgi,.perl,.ph,.plx,.pm,.pod,.psgi,.t,.6pl,.6pm,.nqp,.p6,.p6l,.p6m,.pl6,.pm6,.pkl,.pig,.pike,.pmod,.pogo,.pony,.ps,.eps,.ps1,.psd1,.psm1,.pde,.prolog,.yap,.spin,.proto,.pub,.pd,.pb,.pbi,.purs,.bzl,.gyp,.lmi,.pyde,.pyi,.pyp,.pyt,.pyw,.rpy,.tac,.wsgi,.xpy,.pytb,.qml,.qbs,.pri,.r,.rd,.rsx,.raml,.rdoc,.rbbas,.rbfrm,.rbmnu,.rbres,.rbtbar,.rbuistate,.rhtml,.rmd,.rkt,.rktd,.rktl,.scrbl,.rl,.raw,.reb,.r2,.r3,.rebol,.red,.reds,.cw,.rs,.rsh,.robot,.rg,.rb,.builder,.gemspec,.god,.irbrc,.jbuilder,.mspec,.pluginspec,.podspec,.rabl,.rake,.rbuild,.rbw,.rbx,.ru,.ruby,.thor,.watchr,.sas,.scss,.smt2,.smt,.sparql,.rq,.sqf,.hqf,.cql,.ddl,.prc,.tab,.udf,.viw,.db2,.ston,.sage,.sagews,.sls,.sass,.scala,.sbt,.sc,.scaml,.scm,.sld,.sps,.ss,.sci,.sce,.self,.sh,.bash,.bats,.command,.ksh,.tmux,.tool,.zsh,.sh-session,.shen,.sl,.slim,.smali,.tpl,.sp,.sma,.nut,.stan,.ML,.fun,.sig,.sml,.do,.ado,.doh,.ihlp,.mata,.matah,.sthlp,.styl,.scd,.swift,.sv,.svh,.vh,.toml,.txl,.tcl,.adp,.tm,.tcsh,.csh,.tex,.aux,.bbx,.bib,.cbx,.dtx,.ins,.lbx,.ltx,.mkii,.mkiv,.mkvi,.sty,.toc,.tea,.no,.textile,.thrift,.tu,.ttl,.twig,.upc,.anim,.asset,.mat,.meta,.prefab,.unity,.uno,.uc,.ur,.urs,.vcl,.vhdl,.vhd,.vhf,.vhi,.vho,.vhs,.vht,.vhw,.vala,.vapi,.veo,.vim,.vb,.bas,.frm,.frx,.vba,.vbhtml,.vbs,.volt,.vue,.owl,.webidl,.x10,.xc,.xml,.ant,.axml,.ccxml,.clixml,.cproject,.csl,.csproj,.ct,.dita,.ditamap,.ditaval,.config,.dotsettings,.filters,.fsproj,.fxml,.glade,.grxml,.iml,.ivy,.jelly,.jsproj,.kml,.launch,.mdpolicy,.mxml,.nproj,.nuspec,.odd,.osm,.plist,.props,.ps1xml,.psc1,.pt,.rdf,.rss,.scxml,.srdf,.storyboard,.stTheme,.sublime-snippet,.targets,.tmCommand,.tml,.tmLanguage,.tmPreferences,.tmSnippet,.tmTheme,.ui,.urdf,.ux,.vbproj,.vcxproj,.vssettings,.vxml,.wsdl,.wsf,.wxi,.wxl,.wxs,.x3d,.xacro,.xaml,.xib,.xlf,.xliff,.xmi,.dist,.xproj,.xsd,.xul,.zcml,.xsp-config,.metadata,.xpl,.xproc,.xquery,.xq,.xql,.xqm,.xqy,.xs,.xslt,.xsl,.xojo_code,.xojo_menu,.xojo_report,.xojo_script,.xojo_toolbar,.xojo_window,.xtend,.reek,.rviz,.sublime-syntax,.syntax,.yaml-tmlanguage,.yang,.y,.yacc,.yy,.zep,.zimpl,.zmpl,.zpl,.ec,.eh,.edn,.fish,.mu,.nc,.ooc,.rst,.rest,.wisp,.prg,.prw,.gitignore,.gitkeep,.gitmodules,.example,.avifs,.blp,.bufr,.bw,.cur,.dcx,.dds,.emf,.fit,.fits,.flc,.fli,.ftc,.ftu,.gbr,.grib,.h5,.hdf,.hif,.icb,.icns,.iim,.im,.j2c,.j2k,.jp2,.jpc,.jpe,.jpf,.jpx,.mpeg,.mpg,.msp,.pbm,.pcd,.pcx,.pfm,.pgm,.pnm,.ppm,.psd,.pxr,.qoi,.ras,.rgb,.rgba,.sgi,.tga,.vda,.vst,.wmf,.xpm',
        enable: true
    },
    DOUBAO: {
        id: 'doubao',
        link: 'https://www.doubao.com/chat/',
        name: '豆包',
        avatar: 'doubao.png',
        desc: '豆包是你的 AI 聊天智能对话问答助手，写作文案翻译编程全能工具。豆包为你答疑解惑，提供灵感，辅助创作，也可以和你畅聊任何你感兴趣的话题。',
        accept: '.pdf,.txt,.csv,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.md,.mobi,.epub,.py,.java,.js,.ts,.c,.cpp,.h,.hpp,.html,.css,.php,.rb,.pl,.sh,.bash,.swift,.kt,.go,.dart,.scala,.cs,.xaml,.vue,.json,.yaml,.yml,.xml,.env,.ini,.toml,.plist,.feature,.bat,.md,.cmd,.psl,.vbs,.vmx,.vbox,.dockerfile,.proto,.lua,.mod,.sum,.png,.jpeg,.jpg,.webp,py,java,js,ts,c,cpp,h,hpp,html,css,php,rb,pl,sh,bash,swift,kt,go,dart,scala,cs,xaml,vue,json,yaml,yml,xml,env,ini,toml,plist,feature,bat,md,cmd,psl,vbs,vmx,vbox,dockerfile,proto,lua,mod,sum',
        enable: true
    },
    KIMI: {
        id: 'kimi',
        link: 'https://kimi.moonshot.cn/chat/',
        name: 'Kimi',
        avatar: 'kimi.png',
        desc: 'Kimi是一款学生和职场人的新质生产力工具。帮你解读论文，写代码查BUG，策划方案，创作小说，多语言翻译。有问题问Kimi，一键解决你的所有难题',
        accept: '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.py,.js,.java,.go,.c,.cpp,.html,.json,.h,.py3,.css,.ts,.tsx,.yaml,.yml,.jsp,.php,.asp,.plain,.plaintext,.text,.clike,.arduino,.ino,.bash,.sh,.shell,.csharp,.cs,.dotnet,.markup,.mathml,.svg,.xml,.ssml,.atom,.rss,.diff,.ini,.regex,.javascript,.webmanifest,.kotlin,.kt,.kts,.less,.lua,.makefile,.markdown,.objectivec,.objc,.perl,.markup-templating,.python,.r,.ruby,.rb,.rust,.sass,.scss,.sql,.swift,.typescript,.basic,.vbnet,.pdf,.txt,.md,.jpg,.jpeg,.png,.apng,.bmp,.gif,.webp,.avif,.csv,.mobi,.log,.cxx,.cc,.conf,.epub,.mp4,.avi,.mov,.wmv,.flv,.mpeg,.mpg,.m4v,.webm,.mkv',
        enable: true
    },
    TONGYI: {
        id: 'tongyi',
        link: 'https://www.tongyi.com/qianwen/',
        name: '通义',
        avatar: 'tongyi.png',
        desc: '通义是一个通情、达义的国产AI模型，可以帮你解答问题、文档阅读、联网搜索并写作总结，最多支持1000万字的文档速读。通义_你的全能AI助手',
        accept: '.pdf,.doc,.docx,.md,.markdown,.epub,.mobi,.xlsx,.xls,.txt,.png,.jpg,.jpeg',
        enable: true
    },
    HUNYUAN: {
        id: 'hunyuan',
        link: 'https://llm.hunyuan.tencent.com/#/chat',
        name: '騰訊混元',
        avatar: 'hunyuan.png',
        desc: '腾讯混元大模型是由腾讯研发的大语言模型，具备跨领域知识和自然语言理解能力，实现基于人机自然语言对话的方式，理解用户指令并执行任务，帮助用户实现人获取信息，知识和灵感。',
        accept: '',
        enable: true
    },
    ZHIPU: {
        id: 'zhipu',
        link: 'https://chat.z.ai/',
        name: '智普',
        avatar: 'zhipu.png',
        desc: 'Z Chat is an advanced AI assistant developed by Z.ai. Built on open-source GLM models, it supports text generation, reasoning, and deep research - making it a powerful and free AI chatbot tailored for both English and Chinese users.',
        accept: '',
        enable: true
    },
    MITA: {
        id: 'mita',
        link: 'https://metaso.cn/',
        name: '秘塔AI搜索',
        avatar: 'mita.png',
        desc: '秘塔AI搜索，没有广告，直达结果',
        accept: '.bmp,.png,.jpg,.jpeg,.gif,.webp',
        enable: true
    },
    QINGYAN: {
        id: 'qingyan',
        link: 'https://chatglm.cn/main/alltoolsdetail?lang=zh',
        name: '智譜清言',
        avatar: 'qingyan.png',
        desc: '中国版对话语言模型，与GLM大模型进行对话。',
        accept: '',
        enable: false
    },
    ZHIDA: {
        id: 'zhida',
        link: 'https://zhida.zhihu.com/',
        name: '知乎直達',
        avatar: 'zhida.png',
        desc: '知乎直答（zhida.ai）是知乎推出的一款使用 AI 大模型等先进技术的产品，以知乎社区的优质内容为核心，多种数据源为辅助，为人们提供一种全新的获取可靠信息的途径。知乎直答是多智能体系统，能够满足用户多维度的需求；同时对生成结果进行溯源，以确保内容的可信、可控以及对知识产权和版权的尊重。知乎直答致力于为用户提供卓越的使用体验，用技术拉近创作者和用户之间的距离。有问题，就会有答案。',
        accept: '',
        enable: false
    },
    YIYAN: {
        id: 'yiyan',
        link: 'https://yiyan.baidu.com/',
        name: '文心一言',
        avatar: 'yiyan.png',
        desc: '文心一言既是你的智能伙伴，可以陪你聊天、回答问题、画图识图；也是你的AI助手，可以提供灵感、撰写文案、阅读文档、智能翻译，帮你高效完成工作和学习任务。',
        accept: '',
        enable: false
    },
}

export {USER, ASSISTANTS}