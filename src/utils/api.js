import axios from 'axios';

export async function getGpuPrice(searchQuery) {
  const API_URL = "https://openapi.naver.com/v1/search/shop.json";
  const CLIENT_ID = "네이버 클라이언트 ID";  // 네이버 클라이언트 ID 입력
  const CLIENT_SECRET = "네이버 클라이언트 SECRET";  // 네이버 클라이언트 SECRET 입력

  try {
    // 네이버 API 요청
    const response = await axios.get(API_URL, {
      params: { query: searchQuery, display: 20, sort: "asc" },  // 최대 20개 검색 & 가격순 정렬
      headers: {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET
      }
    });

    let items = response.data.items;

    // 제품 제목에서 불필요한 단어 제거
    function cleanTitle(title) {
      return title.replace(/[\[\]()]/g, '').replace(/(공식|정품|병행|해외|중고|리퍼)/g, '').trim();
    }

    // 가격 필터링 (100,000 이상 3,000,000 이하 가격 필터링)
    let filteredItems = items
      .map(item => ({
        title: cleanTitle(item.title),
        price: parseInt(item.lprice, 10),
        link: item.link
      }))
      .filter(item => item.price > 100000 && item.price < 3000000);  // 가격 범위 설정

    // 최저가 순으로 정렬
    filteredItems.sort((a, b) => a.price - b.price);

    if (filteredItems.length === 0) {
      return { error: "적절한 GPU 가격을 찾을 수 없습니다." };
    }

    return filteredItems[0];  // 최저가 제품 반환

  } catch (error) {
    console.error("네이버 API 요청 오류:", error);
    return { error: "가격 정보를 가져오는 데 실패했습니다." };
  }
}
