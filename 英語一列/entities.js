/* 英語一列 — 固有名詞・人物・事件の文脈注
   語彙帳とは分け、本文を理解するために必要な範囲だけを補う。 */

// セッションごとに、固有名詞の分類・意味・背景と、本文中で探す別名（aliases）をまとめる。
const ENTITY_SESSIONS = {
  session9: {
    "William Hodges": {
      aliases: ["William Hodges", "Hodges"],
      pos: "人物",
      meaning: "本章の中心となる18世紀イギリスの風景画家。",
      background: "クックの第2回航海と英領インドで各地の風景を描いた。本章では、彼の作品を単なる旅行記録ではなく、帝国の領土をイギリスの観客に見える形にしたものとして論じている。"
    },
    "Richard Wilson": {
      pos: "人物",
      meaning: "ホジスが徒弟修業をした風景画家。",
      background: "本文では、ホジスがイギリス風景画の伝統を身につける出発点として登場する。その技法が後に太平洋やインドの風景を描く際の基盤になった。"
    },
    "James Cook": {
      aliases: ["Captain James Cook", "Cook"],
      pos: "人物",
      meaning: "ホジスが第2回航海に同行した探検航海の指揮官。",
      background: "この航海によってホジスは太平洋各地を描く機会を得た。本文では、探検航海と視覚記録が帝国の知識形成に結びつく重要な接点である。"
    },
    "Warren Hastings": {
      pos: "人物",
      meaning: "ホジスのインド滞在を支援したベンガル総督。",
      background: "彼の後援により、ホジスはインド各地を旅行し制作できた。一方で、ヘイスティングズの統治は帰国後に弾劾の対象となり、芸術・後援・植民地支配の近さを示している。"
    },
    "East India Company": {
      pos: "組織",
      meaning: "当時のイギリスによるインド統治と交易の中核を担った会社。",
      background: "単なる商社ではなく、軍事力と行政権を持って領域を支配していた。ホジスのインド旅行は、この会社が作った植民地権力の枠組みの中で可能になった。"
    },
    "Royal Academy": {
      pos: "組織",
      meaning: "1768年に設立されたイギリス美術界の中心的機関。",
      background: "展覧会と教育を通じて、職業画家の評価や「正統な」美術の基準を形作った。本文では、帝国の拡大と美術制度の発達が同時進行したことを示す。"
    },
    "Seven Years' War": {
      pos: "事件",
      meaning: "1756〜63年に欧州・北米・インドなどで戦われた国際戦争。",
      background: "勝利したイギリスは広大な植民地を獲得した。ホジスの修業期と重なり、彼が後に描く帝国の地理的拡大を準備した戦争として挙げられている。"
    },
    "American Revolutionary War": {
      pos: "事件",
      meaning: "北米13植民地がイギリスから独立した戦争。",
      background: "ホジスがクック航海から帰国した時期に始まった。本文はこれを、旧帝国の崩壊と新たな帝国形成の間に彼の画業を位置づける出来事として扱う。"
    },
    "First Maratha War": {
      pos: "事件",
      meaning: "イギリス東インド会社とマラーター勢力の戦争。",
      background: "ホジスのインド滞在と終盤が重なる。彼の風景制作が平穏な旅行ではなく、植民地戦争の進行する環境で行われたことを示す。"
    },
    "Second Mysore War": {
      pos: "事件",
      meaning: "東インド会社と南インドのマイソール王国の戦争。",
      background: "ホジスはこの戦争期の軍事行動を間近で見た。本文では、戦争を嘆く画家が軍の保護と画題に依存していたという矛盾を際立たせる。"
    }
  },

  session10: {
    "Edmund Burke": {
      aliases: ["Edmund Burke", "Burke"],
      pos: "人物",
      meaning: "本文が「人類の地図」という比喩を引用する政治思想家。",
      background: "社会を文明の段階が並ぶ一枚の地図として捉えた。その視覚的な歴史観が、各地の人々と風景を一望できる形で示すホジスの絵画と結びつけられている。"
    },
    "William Robertson": {
      pos: "人物",
      meaning: "文明を段階的発展として記述した歴史家。",
      background: "本文では『アメリカ史』の図式が紹介される。ヨーロッパを頂点、北米先住民社会を初期段階に置く分類が、当時の帝国的な世界認識の例となっている。"
    },
    "History of America": {
      pos: "作品",
      meaning: "ロバートソンがアメリカ大陸の歴史を論じた著作。",
      background: "本文が問題にするのは、異なる社会を同時代の対等な存在ではなく、文明発展の異なる段階として並べる視点である。"
    },
    "Akbar": {
      aliases: ["Emperor Akbar", "Akbar"],
      pos: "人物",
      meaning: "ムガル帝国の皇帝で、シカンドラの墓廟の被葬者。",
      background: "ホジスが描いた壮大な墓廟を通して登場する。本文では、その遺構が過去のムガル権力と、台頭するイギリス支配とを対照させる装置になる。"
    },
    "Sikandra": {
      pos: "地名",
      meaning: "アグラ近郊にあるアクバル廟の所在地。",
      background: "ホジスの作品では、廃墟的・絵画的な景観として表される。その見せ方が、インドの過去を衰退したものとして眺めるイギリス側の歴史観と関係する。"
    },
    "Mughal Empire": {
      aliases: ["Mughal"],
      pos: "国家",
      meaning: "インド亜大陸を長く支配したイスラーム王朝。",
      background: "本文では、ムガルの建築遺産が過去の偉大さと現在の衰退を示すものとして読まれる。それがイギリスの新しい支配を暗黙に正当化する構図につながる。"
    },
    "Ozymandias": {
      aliases: ["Ozymandian"],
      pos: "作品・典拠",
      meaning: "巨大な権力もやがて廃墟になるというイメージの典拠。",
      background: "本文の Ozymandian は、シェリーの詩で知られる滅びた王の記念碑を連想させる。ホジスの廃墟表現に、帝国の盛衰を読むための形容として使われている。"
    }
  },

  session11: {
    "Walter Pitts": {
      aliases: ["Walter Pitts", "Pitts"],
      pos: "人物",
      meaning: "神経活動を論理計算として表す理論を作った、本章の中心人物。",
      background: "独学の論理学者としてマカロックと共同研究を行った。本文では、整然とした論理への強い愛着と、彼自身の不安定な生涯との対照が物語の軸になる。"
    },
    "Warren McCulloch": {
      aliases: ["Warren McCulloch", "McCulloch"],
      pos: "人物",
      meaning: "ピッツとともに形式ニューロンの理論を作った神経生理学者。",
      background: "脳の神経細胞の発火を真偽の命題として扱えると考えた。ピッツの論理学の力と結びつくことで、脳・論理・計算機を一つのモデルで捉えた。"
    },
    "Principia Mathematica": {
      aliases: ["Principia Mathematica", "Principia"],
      pos: "作品",
      meaning: "数学を論理から構成しようとしたラッセルとホワイトヘッドの大著。",
      background: "ピッツとマカロックの双方に重要な着想を与えた。単純な命題と論理演算から複雑な体系を作る発想が、ニューロン回路のモデルへ移される。"
    },
    "Bertrand Russell": {
      aliases: ["Bertrand Russell", "Russell"],
      pos: "人物",
      meaning: "『プリンキピア・マテマティカ』の共著者。",
      background: "少年ピッツが同書の誤りを知らせる手紙を送り、その能力を認められたという逸話に登場する。本文では、ピッツが学界へ接近するきっかけでもある。"
    },
    "Alfred Whitehead": {
      aliases: ["Alfred Whitehead", "Whitehead"],
      pos: "人物",
      meaning: "ラッセルとともに『プリンキピア・マテマティカ』を書いた数学者・哲学者。",
      background: "本文では個人の経歴より、数学を少数の論理規則から組み立てる計画の担い手として重要である。"
    },
    "Jerome Lettvin": {
      aliases: ["Jerome Lettvin", "Lettvin"],
      pos: "人物",
      meaning: "ピッツとマカロックを引き合わせた医学生。",
      background: "二人の共同研究が始まる人的な接点を作った。後にも彼らの研究仲間となり、この物語の重要な証言者として登場する。"
    },
    "Gottfried Leibniz": {
      aliases: ["Gottfried Leibniz", "Leibniz"],
      pos: "人物",
      meaning: "思考を記号と計算に置き換える構想を持った17世紀の哲学者。",
      background: "ピッツとマカロックが共有する「英雄」として登場する。あらゆる推論を規則に従う計算へ変える構想が、二人の脳モデルの思想的な先駆けとなる。"
    },
    "Alan Turing": {
      pos: "人物",
      meaning: "計算可能性を抽象的な機械で定式化した数学者。",
      background: "本文では、神経回路を計算機として捉える二人の理論と接続する人物である。論理操作を機械的手順として実行できるという共通の発想を与える。"
    }
  },

  session12: {
    "Walter Pitts": {
      aliases: ["Walter Pitts", "Pitts"],
      pos: "人物",
      meaning: "マカロックと神経回路の論理モデルを完成させた研究者。",
      background: "この章では理論の成功後、ウィーナーの研究グループとの関係や、マカロックとの共同生活・共同研究が描かれる。"
    },
    "Warren McCulloch": {
      aliases: ["Warren McCulloch", "McCulloch"],
      pos: "人物",
      meaning: "ピッツとの共著論文を主導した神経生理学者。",
      background: "個々のニューロンの働きを論理演算へ対応させ、脳を計算装置として記述した。本文では研究上の協力者であると同時に、ピッツの生活を支える存在でもある。"
    },
    "A Logical Calculus of Ideas Immanent in Nervous Activity": {
      aliases: ["Logical Calculus of Ideas Immanent in Nervous Activity"],
      pos: "論文",
      meaning: "マカロックとピッツが1943年に発表した神経回路モデルの論文。",
      background: "ニューロンをオン／オフの論理素子として表し、回路が命題計算を実行できることを示した。後のニューラルネットワークとデジタル計算機の双方につながる論文である。"
    },
    "Bulletin of Mathematical Biophysics": {
      pos: "刊行物",
      meaning: "二人の重要論文が掲載された学術誌。",
      background: "論理学と神経生理学を結ぶ研究が、数理生物物理という新しい領域で発表されたことを示している。"
    },
    "Norbert Wiener": {
      aliases: ["Norbert Wiener", "Wiener"],
      pos: "人物",
      meaning: "ピッツらをMITに招いた数学者で、サイバネティクスの中心人物。",
      background: "生物と機械を、情報・制御・フィードバックという共通原理で研究した。二人の神経回路モデルを高く評価し、研究のより大きな枠組みを与えた。"
    },
    "MIT": {
      aliases: ["Massachusetts Institute of Technology", "MIT"],
      pos: "組織",
      meaning: "ウィーナーのもとでピッツらが研究した工科大学。",
      background: "本文では、シカゴで生まれた理論が計算・通信研究の中心へ移る舞台となる。ピッツが初めて正式な学位取得へ進む場所でもある。"
    }
  },

  session13: {
    "Nollywood": {
      pos: "産業",
      meaning: "ナイジェリアの大規模な映像産業を指す呼称。",
      background: "本文では、イボ語映画から英語映画への転換が市場と人材を広げる一方、言語・民族・観客の関係を複雑にした産業として論じられる。"
    },
    "Living in Bondage": {
      pos: "作品",
      meaning: "1992年のイボ語ビデオ映画で、初期ノリウッドの転機となった作品。",
      background: "商業的成功によってビデオ映画製作の可能性を示した。本文ではイボ語映画の代表であると同時に、その後の英語中心化を考える基準点になる。"
    },
    "Glamour Girls": {
      pos: "作品",
      meaning: "ノリウッドの英語化と観客拡大を象徴する映画。",
      background: "英語を用い、イボ人以外の俳優も起用することで、地域的な言語市場を越える作品となった。本文の議論では人材と市場の転換点を示す。"
    },
    "Chinua Achebe": {
      aliases: ["Chinua Achebe", "Achebe"],
      pos: "人物",
      meaning: "イボ社会を英語で描いたナイジェリアの作家。",
      background: "本文では、植民者の言語である英語を使いながらイボ文化をどう表現するかという先行例になる。『Things Fall Apart』から、イボ社会における会話と言葉の重みも引用される。"
    },
    "Things Fall Apart": {
      pos: "作品",
      meaning: "アチェベが植民地化前後のイボ社会を描いた小説。",
      background: "本文では、英語で書かれながらイボの言語感覚や文化を伝える作品として参照される。ノリウッドの言語選択を考える文学上の比較対象である。"
    },
    "Nollywood Babylon": {
      pos: "作品",
      meaning: "ノリウッドを扱った2008年のカナダのドキュメンタリー。",
      background: "英語話者のナイジェリア人にも字幕を付けた例として挙げられる。英語を使えば海外でそのまま理解される、という前提の限界を示す。"
    },
    "Onookome Okome": {
      pos: "人物",
      meaning: "『Nollywood Babylon』に登場するナイジェリア映画研究者。",
      background: "カナダで英文学を教える英語の専門家である彼にも字幕が付いた。この事例は、言語能力ではなくアクセントが国際流通の障壁になることを強調する。"
    },
    "Amaka Igwe": {
      pos: "人物",
      meaning: "イボ語での演技・方言・字幕制作の難しさを語る映画制作者。",
      background: "俳優の方言を揃える困難や、字幕追加による費用と画質劣化を経験した。本文では、イボ語映画が衰退した実務上の理由を具体化する証言者である。"
    },
    "Rattlesnake": {
      pos: "作品",
      meaning: "アマカ・イグウェが制作した1995年の映画。",
      background: "イボ語の豊かな比喩や会話によって撮影素材が予定を大幅に超えた例として登場する。言語の文化的豊かさが制作上の負担にもなる逆説を示す。"
    },
    "Igbo": {
      aliases: ["Igbo", "Ibo"],
      pos: "民族・言語",
      meaning: "ナイジェリア南東部を中心とする民族、およびその言語。",
      background: "初期ノリウッドを支えた言語文化だが、標準語・出版・放送・俳優層の基盤が弱く、映画は短期間で英語中心へ移ったと本文は説明する。"
    },
    "Yoruba": {
      pos: "民族・言語",
      meaning: "ナイジェリア南西部を中心とする民族、およびその言語。",
      background: "強い標準語と演劇・放送の基盤を持ち、映画製作が継続した。本文ではイボ語映画の急速な衰退を比較する対象となる。"
    },
    "Hausa": {
      pos: "民族・言語",
      meaning: "ナイジェリア北部などで広く使われる言語、およびその話者集団。",
      background: "標準語と文化的インフラを背景に独自の映画市場を維持した。イボ語とは異なる発展経路を示す比較例である。"
    }
  }
};
