# The Soul

GitHub Pages에서 실행하는 Godot 웹 게임입니다. 이 저장소에는 실행에 필요한 웹 파일만 포함합니다.

## 배포

1. eunhyeogjang72-cpu/the-soul 저장소에서 배포 브랜치를 만들고 이 묶음의 파일을 반영합니다. 이전 버전의 dist는 새 dist로 교체합니다.
2. 변경 사항을 main에 병합하면 Publish The Soul 워크플로가 GitHub Pages로 배포합니다.
3. **Actions → Publish The Soul**에서 결과와 게임 주소를 확인합니다.

다른 저장소에서 처음 배포할 때는 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다.

## 구매한 도메인 연결

먼저 저장소 **Settings → Pages → Custom domain**에 thesoulproject.kr을 저장합니다.
예스닉에서 기본 도메인의 웹사이트용 A 레코드를 GitHub Pages의 아래 네 개로 교체합니다.
이 예스닉 화면에서는 호스트명을 빈칸으로 둡니다.

| 종류 | 호스트 | 값 |
| --- | --- | --- |
| A | 빈칸 | 185.199.108.153 |
| A | 빈칸 | 185.199.109.153 |
| A | 빈칸 | 185.199.110.153 |
| A | 빈칸 | 185.199.111.153 |

DNS 확인과 인증서 발급 후 **Enforce HTTPS**를 켭니다.
GitHub 계정 Settings → Pages에서 도메인을 인증하면 도메인 소유권도 보호할 수 있습니다.
GitHub가 제공하는 TXT 인증값을 사용하며, 이전 Sites의 TXT 값은 GitHub 인증에 사용되지 않습니다.

## 업데이트

새로 준비한 웹 파일로 dist를 교체하고 main에 올리면 자동 배포됩니다.
큰 파일은 각각 20MiB 이하로 분할돼 있습니다. 전체 묶음은 Git으로 올립니다.
이름이 같은 index.pck, index.wasm 원본을 추가하지 마세요. 브라우저에서 분할 파일을 조립합니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
도메인 안내: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
