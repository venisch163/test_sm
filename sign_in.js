import axios from 'axios'
import { getHeaders } from './lib/http_util.js'
import getCookie from './cookies.js'

async function signIn() {
  const cookies = await getCookie()

  const tokenEntry = cookies.find(entry => entry['SHM_JWT_TOKEN'] !== undefined)
  if (tokenEntry === undefined) {
    throw Error('cannot get authorization')
  }

  let headers = getHeaders()
  headers.authorization = 'JwtUser '.concat(tokenEntry['SHM_JWT_TOKEN'])
  let data = JSON.stringify({
    //请求参数为：{}，经过AES算法加密之后就是: S1uAYaf/g6oBpv8DWUaQlQ==，在前端js代码中搜索encryptBody关键字
    encryptBody: 'S1uAYaf/g6oBpv8DWUaQlQ=='
  })

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://www.shang-ma.com/api/v1/user/integral/sign-in',
    headers: headers,
    data: data
  }

  // 1. 创建自定义 httpsAgent（示例：忽略 SSL 证书验证 + 保持连接复用）
  const customHttpsAgent = new https.Agent({
    rejectUnauthorized: false
  });
  // 2. 注册全局请求拦截器：在 request 前修改 agent
  axios.interceptors.request.use(
    (config) => {
      // 根据请求协议，动态设置对应的 agent
      if (config.url.startsWith('https://')) {
        config.httpsAgent = customHttpsAgent; // HTTPS 请求用自定义 httpsAgent
      } else if (config.url.startsWith('http://')) {
        // config.agent = customHttpAgent; // HTTP 请求用自定义 httpAgent（可选）
      }
      return config; // 必须返回修改后的 config，否则请求会失败
    },
    (error) => {
      // 拦截器错误处理（如请求配置生成失败）
      return Promise.reject(error);
    }
  );

  
  const response = await axios.request(config)
  console.log(JSON.stringify(response.data))
  if (response.status !== 200) {
    throw Error('sign in return http status error:' + response.status)
  }
  if (response.data.code !== 0 && response.data.code !== 5001) {
    throw Error('sign in code error:' + response.data.code)
  }
}

export default signIn
