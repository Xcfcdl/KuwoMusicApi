import express from 'express';
import lodash from 'lodash';
import handleGetMusicUrl from './kw/url.js';
import handleMusicSearch from './kw/search.js';

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const port = process.env.PORT || 3005;

app.use(express.json());

app.get('/url', async (req, res) => {
  const result = await handleGetMusicUrl(req.query.id, req.query.quality)
  if (result.msg !== 'success') res.status(400).json(result)
  else res.status(200).json(result)
});

app.get('/search', async (req, res) => {
  const result = await handleMusicSearch(req.query.keyword, req.query.page ? parseInt(req.query.page) : 1)
  if (result.msg !== 'success') res.status(400).json(result)
  else res.status(200).json(result)
});

app.get('/precise-get', async (req, res) => {
  const artist = req.query.artist;
  if (!artist) {
    res.status(400).json({msg:"缺少参数", data: null});
    return;
  }
  const input = {
    name: req.query.songname,
    artist,
    artistList: artist.split("&"),
    duration: parseInt(req.query.duration)
  };

  const searchResult = await handleMusicSearch(`${req.query.songname} ${artist}`);

  // console.log(searchResult.data)
  if (!searchResult.data) {
    res.status(400).json({ msg: '歌曲未找到对应的可解灰源', data: null });
    return;
  }

  let select;
  for (const sear of searchResult.data) {
    /*
    console.log(sear);
    console.log(input);
    */
    let ndiffer = lodash.uniq(lodash.difference(sear.name.split(''), input.name.split('')).concat(lodash.difference(input.name.split(''), sear.name.split(''))))
    let nadiffer_res = ndiffer.length / ((sear.name.length + input.name.length) / 2) <= 0.1
    if (!sear.name.startsWith(input.name) && nadiffer_res) continue;
    console.log('name pass')

    const searArtistList = sear.artist.split("&");
    const differ = lodash.uniq(lodash.difference(input.artistList, searArtistList).concat(lodash.difference(searArtistList, input.artistList)));
    // console.log(differ)
    if (differ.length / ((input.artistList.length + searArtistList.length) / 2) > 0.5) continue;
    console.log("artist pass")
    if (!Number.isNaN(input.duration) && Math.abs(input.duration - sear.duration) > 10) continue;
    console.log("duration pass")

    select = sear;
    break;
  }

  if (!select) {
    res.status(400).json({ msg: '歌曲未找到对应的可解灰源', data: null });
    return;
  }

  console.log('select song: ', select)

  if (req.query.withurl == 'true') {
    if (!Object.keys(select.quality).includes(req.query.quality)) {
      res.status(400).json({ msg: '歌曲无对应音质', data: { url: null, info: select } });
      return;
    }

    const musicUrl = await handleGetMusicUrl(select.id, req.query.quality);
    console.log(musicUrl)
    if (musicUrl.msg !== 'success') {
      res.status(400).json({ msg: '播放链接获取失败', data: { url: null, info: select } });
      return;
    } else {
      res.status(200).json({ msg: 'success', data: { url: musicUrl.url, info: select } });
      return;
    }
  } else {
    res.status(200).json({ msg: 'success', data: select });
    return;
  }
});

app.get('/first-geturl', async (req, res) => {
  const searchResult = await handleMusicSearch(req.query.keyword)
  if (!searchResult.data || searchResult.data.length === 0) {
    res.status(400).json({ msg: '搜索结果为空或出错', data: null });
    return;
  }
  const select = searchResult.data[0]
  if (!Object.keys(select.quality).includes(req.query.quality)) {
    res.status(400).json({ msg: '歌曲无该音质', data: { url: null, info: select } });
    return;
  }

  const musicUrl = await handleGetMusicUrl(select.id, req.query.quality)
  if (musicUrl.msg !== 'success') res.status(400).json({ msg: '播放链接获取失败', data: { url: null, info: select } })
  else res.status(200).json({ msg: 'success', data: { url: musicUrl.url, info: select } });
  return
});

app.listen(port, () => {
  console.log(`服务运行在 http://localhost:${port}`);
});
