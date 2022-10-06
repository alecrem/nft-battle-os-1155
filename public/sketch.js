// キャラクターはこのトークンから作ります
// https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/59838097694147095793777431733585202279455896843409983234570034067316292976641
// character_imgurl はOpenSeaで表示されている画像のURL

let character_imgurl =
  'https://lh3.googleusercontent.com/D1SczNIqYB2v453FMKb_DIi9YAzp5uSri4TqsuV3R8qqGnfUMfwItUl77TMMH8P6J6-e3VCMCcEyat2bIdZ9KgJW8CVLkyANebAs9A=s0'
// character_seedはURLの最後の数字の右の14桁
// キャラクターの能力値を決めるのに使います
// 乱数から能力値を決める時と似たようなやり方を使いますが
// これは乱数ではなくて、NFTそれぞれが何回やっても同じ能力値になる仕様
const character_seed = 67316292976641

// 敵の画像にはとりあえずこのトークンのページで表示される画像のURLを使います
// https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/66944570731711987735845020825364593806926065595037873500763412731449170722817
const enemy_imgurl =
  'https://lh3.googleusercontent.com/XUlJ3s4X3x1fsjE6bOl7GtTRmDIlAl1RPpvZWZ87yE4Yn832ESXKt_Btm9wets_A7jaI57yGr4TtxCRBgC3ChKr3bpXjfzh2TA7UMw=s0'

// CharacterとEnemyのそれぞれのクラスで setup の中で作るオブジェクト
let character, enemy

// 攻撃力はpower_minとpower_maxの間の数値になる予定
const power_min = 40
const power_max = 70
// 防御力はtoughness_minとtoughness_maxの間の数値になる予定
const toughness_min = 40
const toughness_max = 70
// 攻撃力+防御力+体力==stats_total
// と決めて、体力はstats_total-攻撃力-防御力 のように求める予定
const stats_total = 255

// 敵を生成するときにレベルを指定できます
// level_maxになるとstats_totalがキャラクターと同じになります
const level_min = 10
const level_max = 50

const canvasWidth = 400
const canvasHeight = 400

let tokenimage = document.getElementById('tokenimage')
let checkIfReadyIntervalId
var something = 999
var something_cachedValue = something

function checkUntilReady() {
  if (document.getElementById('tokenimage') === null) {
    setTimeout(checkUntilReady, 50)
    console.log('mada', document.getElementById('tokenimage'))
    return
  }
  tokenimage = document.getElementById('tokenimage')
  console.log('done!', tokenimage.value)
  character_imgurl = tokenimage.value
  setup()
}

function preload() {
  checkUntilReady()
}

function setup() {
  if (document.getElementById('tokenimage') === null) return
  let myCanvas = createCanvas(canvasWidth, canvasHeight)
  myCanvas.parent('p5jscanvas')
  // キャラクターの能力値はcharacter_seedという8桁以上の数字から決まります
  character = new Character(character_imgurl, character_seed)
  // 敵の能力値は10〜50のレベルから決まります
  enemy = new Enemy(enemy_imgurl, 20)

  // 減っている体力の見た目が確認できるように
  // （ゲームの動きではありません）
  enemy.hp = ~~((enemy.maxhp * 60) / 100)
  // ~~ とはMath.floorと同じ結果になります（小数点以下を切り捨てで整数にする）
}

function draw() {
  if (document.getElementById('tokenimage') === null) return
  if (!character) return
  background(255)
  character.display()
  enemy.display()
}

class Character {
  constructor(imgurl, seed) {
    this.imgurl = imgurl
    this.seed = seed

    // 攻撃力はseedの右の4桁から決まります
    const power_seed = this.seed % 10000
    // 0〜9999から冒頭に設定してある攻撃力の範囲に変換
    // ~~ とはMath.floorと同じ結果になります（小数点以下を切り捨てで整数にする）
    this.power = ~~map(power_seed, 0, 9999, power_min, power_max)

    // 防御力はseedの右から8桁目から5桁目までの数字から決まります
    const toughness_seed = ~~((this.seed % 100000000) / 10000)
    // 0〜9999から冒頭に設定してある防御力の範囲に変換
    this.toughness = ~~map(
      toughness_seed,
      0,
      9999,
      toughness_min,
      toughness_max
    )

    // 体力（満タン）はstats_totalまで残った分になります
    this.maxhp = stats_total - this.power - this.toughness
    // 体力を満タンの数値に初期化
    this.hp = this.maxhp

    // 画像をURLから読み込む
    this.img = loadImage(this.imgurl)
  }

  display() {
    // コードが長くならないように別名定数を使います
    const w = canvasWidth
    const h = canvasHeight

    // 画像を画面の左下に表示
    push()
    translate(0, h * 0.55)
    image(this.img, 0, 0, h * 0.45, h * 0.45)
    pop()

    // 能力値を画面の右下に表示
    push()
    translate(h * 0.5, h * 0.5)
    // 体力ゲージ。赤は満タン（背景）で緑は現状
    noStroke()
    fill('red')
    rect(0, h * 0.25 - 15, w * 0.4, 15)
    fill('green')
    rect(0, h * 0.25 - 15, (w * 0.4 * this.hp) / this.maxhp, 15)
    fill(0)
    text('体力:', 0, h * 0.25 + 15)
    text('攻撃力:', 0, h * 0.25 + 30)
    text('防御力:', 0, h * 0.25 + 45)
    text(this.hp + '/' + this.maxhp, 0 + 45, h * 0.25 + 15)
    text(this.power, 0 + 45, h * 0.25 + 30)
    text(this.toughness, 0 + 45, h * 0.25 + 45)
    pop()
  }
}

class Enemy {
  constructor(imgurl, level) {
    this.imgurl = imgurl
    this.level = level
    // 10〜50のレベルから冒頭に設定してある攻撃力の範囲に変換
    this.power = ~~map(level, level_min, level_max, power_min, power_max)
    // 10〜50のレベルから冒頭に設定してある防御力の範囲に変換
    this.toughness = ~~map(
      level,
      level_min,
      level_max,
      toughness_min,
      toughness_max
    )
    const enemy_stats_total = ~~map(
      level,
      level_min,
      level_max,
      stats_total * 0.65,
      stats_total
    )
    this.maxhp = enemy_stats_total - this.power - this.toughness
    this.hp = this.maxhp
    this.img = loadImage(this.imgurl)
  }

  display() {
    const w = canvasWidth
    const h = canvasHeight

    // 画像を画面の右上に表示
    push()
    translate(w * 0.55, 0)
    image(this.img, 0, 0, h * 0.45, h * 0.45)
    pop()

    // 能力値を画面の左上に表示
    push()
    translate(h * 0.1, 0)
    noStroke()
    fill('red')
    rect(0, h * 0.25 - 15, w * 0.4, 15)
    fill('green')
    rect(0, h * 0.25 - 15, (w * 0.4 * this.hp) / this.maxhp, 15)
    fill(0)
    text('体力:', 0, h * 0.25 + 15)
    text('攻撃力:', 0, h * 0.25 + 30)
    text('防御力:', 0, h * 0.25 + 45)
    text(this.hp + '/' + this.maxhp, 0 + 45, h * 0.25 + 15)
    text(this.power, 0 + 45, h * 0.25 + 30)
    text(this.toughness, 0 + 45, h * 0.25 + 45)
    pop()
  }
}
