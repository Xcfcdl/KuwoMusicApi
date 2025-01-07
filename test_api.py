import requests
import json

def test_api(base_url="http://localhost:3005"):
    """测试 KuwoMusicApi 的所有端点"""
    
    print("开始测试 KuwoMusicApi...")
    
    # 测试用例
    test_cases = [
        {
            "name": "1. 模糊查找测试",
            "endpoint": "/first-geturl",
            "params": {
                "keyword": "最伟大的作品 周杰伦",
                "quality": "lossless"
            }
        },
        {
            "name": "2. 精确查找测试",
            "endpoint": "/precise-get",
            "params": {
                "songname": "最伟大的作品",
                "artist": "周杰伦",
                "duration": "244",
                "quality": "lossless",
                "withurl": "true"
            }
        },
        {
            "name": "3. ID直接获取测试",
            "endpoint": "/url",
            "params": {
                "id": "226543302",
                "quality": "lossless"
            }
        }
    ]
    
    for test in test_cases:
        print(f"\n{test['name']}")
        print("-" * 50)
        
        try:
            url = f"{base_url}{test['endpoint']}"
            print(f"请求URL: {url}")
            print(f"参数: {json.dumps(test['params'], ensure_ascii=False, indent=2)}")
            
            response = requests.get(url, params=test['params'])
            
            print(f"状态码: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print("响应数据:")
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误响应: {response.text}")
                
        except Exception as e:
            print(f"测试失败: {str(e)}")

if __name__ == "__main__":
    # 本地测试
    print("测试本地服务器...")
    test_api("http://localhost:3005")
    
    # Vercel 部署测试
    print("\n\n测试 Vercel 部署...")
    vercel_url = input("请输入你的 Vercel 部署 URL: ")
    if vercel_url:
        test_api(vercel_url.rstrip('/')) 