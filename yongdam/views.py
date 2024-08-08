from rest_framework import viewsets
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from .models import Yongdamcadastralall, Yongdamcadastraltarget
from .filters import YongdamcadastralallFilter, YongdamcadastraltargetFilter
from .serializers import YongdamcadastralallSerializer, YongdamcadastraltargetSerializer
import requests
from django.http import JsonResponse , HttpResponse
from django.shortcuts import render
from django.core.cache import cache
import logging

logger = logging.getLogger('yongdam')


class YongdamcadastralallViewSet(viewsets.ModelViewSet):
    queryset = Yongdamcadastralall.objects.all()
    serializer_class = YongdamcadastralallSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = YongdamcadastralallFilter

    def get_queryset(self):  # ViewSet 이 반환할 쿼리셋을 커스터마이징
        queryset = super().get_queryset()
        jibun = self.request.query_params.get(
            'jibun')  # 요청의 쿼리 파라미터에서 jibun 값을 가져옴
        if jibun:
            jibun_list = jibun.split(',')  # 지번값이 존재하면 , 쉼표로 분리해 리스트로 만듬
            # jibun 값이 리스트에 포함된 레코드를 필터링
            queryset = queryset.filter(jibun__in=jibun_list)
            # jibun_ _ in : 주어진 리스트나 튜플에 해당 필드값이 포함되는 여부를 필터링 할때 사용
            # ex filter(jibun__in =['value1','value2']) 는 jibun 필드가 'value1 또는 'value2' 인 레코드를 필터링
        return queryset

    # def create(self, request, *args, **kwargs):
    #     if isinstance(request.data, list):
    #         # 여러 데이터가 포함된 리스트인 경우
    #         serializer = self.get_serializer(data=request.data, many=True)
    #     else:
    #         # 단일 데이터인 경우
    #         serializer = self.get_serializer(data=request.data)

    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)

    #     if isinstance(request.data, list):
    #         # 여러 데이터를 생성한 경우, 각 레코드의 상세 정보로 응답
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     else:
    #         # 단일 데이터를 생성한 경우, 상세 정보로 응답
    #         headers = self.get_success_headers(serializer.data)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class YongdamcadastraltargetViewSet(viewsets.ModelViewSet):
    queryset = Yongdamcadastraltarget.objects.all()
    serializer_class = YongdamcadastraltargetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = YongdamcadastraltargetFilter

    def get_queryset(self):  # ViewSet 이 반환할 쿼리셋을 커스터마이징
        queryset = super().get_queryset()
        jibun = self.request.query_params.get(
            'jibun')  # 요청의 쿼리 파라미터에서 jibun 값을 가져옴
        if jibun:
            jibun_list = jibun.split(',')  # 지번값이 존재하면 , 쉼표로 분리해 리스트로 만듬
            # jibun 값이 리스트에 포함된 레코드를 필터링
            queryset = queryset.filter(jibun__in=jibun_list)
            # jibun_ _ in : 주어진 리스트나 튜플에 해당 필드값이 포함되는 여부를 필터링 할때 사용
            # ex filter(jibun__in =['value1','value2']) 는 jibun 필드가 'value1 또는 'value2' 인 레코드를 필터링
        return queryset

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            # 여러 데이터가 포함된 리스트인 경우
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            # 단일 데이터인 경우
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        if isinstance(request.data, list):
            # 여러 데이터를 생성한 경우, 각 레코드의 상세 정보로 응답
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # 단일 데이터를 생성한 경우, 상세 정보로 응답
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


def api_v2_get_jobs(request):
    pname_to_search = request.GET.get('pname')

    login_url = "http://api.dromii.com:8080/api/v2/login"
    jobs_url = "http://api.dromii.com:8080/api/v2/jobs"
    projects_url = "http://api.dromii.com:8080/api/v2/projects"
    api_key = "YCmLIC7b8HT6xjd5rL2SPvuMdnYwiQEb"
    login_payload = {
        "email": "superuser@dromii.com",
        "password": "1234"
    }
    headers = {
        "Content-Type": "application/json",
        "apikey": api_key
    }

    try:

        #access_token = cache.get('access_token')
        access_token = cache.get('access_token')
        logger.info("access_token 없음, 새로운 토큰 요청 시도")

        # 로그인 요청을 보내서 토큰을 받음
        if access_token is None:
            login_response = requests.post(
                login_url, json=login_payload, headers=headers)

            login_response.raise_for_status()  # HTTP 에러가 발생하면 예외를 일으킵니다.

            login_data = login_response.json()

            access_token = login_data.get('access')

            if not access_token:
                logger.error("access_token 가져올 수 없음")
                
                return JsonResponse({'error': 'Access token not found in login response'}, status=500)
            # 토큰을 캐시에 저장하고 만료 시간을 24시간으로 설정
            try: 
                cache.set('access_token', access_token, timeout=86400)  # 24시간 = 86400초
                logger.info(f"새로운 access_token 캐싱: {access_token}")
            except Exception as e:
                logger.error(f"캐시에 access_token 저장 중 오류 발생: {str(e)}")

        else:

            logger.info(f"캐시에서 access_token 가져옴: {access_token}")

        # 토큰을 사용하여 실제 데이터를 가져옴
        jobs_headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {access_token}"
        }
        jobs_response = requests.get(jobs_url, headers=jobs_headers)
        jobs_response.raise_for_status()

        jobs_data = jobs_response.json()
        listjobs = jobs_data.get('listjobs', [])

        # pname 파라미터가 없을 경우 모든 job 데이터 반환
        if not pname_to_search:
            filtered_jobs_data = [
                {
                    'pcode': job.get('pcode'),
                    'title': job.get('title'),
                    'jcode': job.get('jcode')
                }
                for job in listjobs
            ]
            return JsonResponse({'access_token': access_token, 'jobs': filtered_jobs_data}, safe=False)

        # 프로젝트 데이터를 가져옴
        projects_headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {access_token}"
        }
        projects_response = requests.get(
            projects_url, headers=projects_headers)
        projects_response.raise_for_status()

        projects_data = projects_response.json()
        listprojects = projects_data.get('listprojects', [])

        # pname으로 검색하여 해당 pcode를 찾음
        matching_project = next((project for project in listprojects if project.get(
            'pname') == pname_to_search), None)
        if not matching_project:
            return JsonResponse({'error': f'Project with pname {pname_to_search} not found'}, status=404)

        pcode_to_search = matching_project.get('pcode')

        # 필요한 데이터만 추출하고, pcode가 일치하는 job만 반환
        filtered_jobs_data = [
            {
                'pcode': job.get('pcode'),
                'title': job.get('title'),
                'jcode': job.get('jcode'),
                'lonlat': job.get('lonlat')
            }
            for job in listjobs if job.get('pcode') == pcode_to_search
        ]

        return JsonResponse({'access_token': access_token, 'jobs': filtered_jobs_data}, safe=False)

    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)




def api_get_v2_image(request, job_id):
    context = {
        'job_id': job_id
    }
    return render(request, 'yongdam/map.html', context)

# 좌표 반환 api 
def get_coordinate(request, job_id):
    
    login_url = "http://api.dromii.com:8080/api/v2/login"
    info_url = f"http://api.dromii.com:8080/api/v2/jobs/info/{job_id}"
    api_key = "YCmLIC7b8HT6xjd5rL2SPvuMdnYwiQEb"
    login_payload = {
        "email": "superuser@dromii.com",
        "password": "1234"
    }
    headers = {
        "Content-Type": "application/json",
        "apikey": api_key
    }

    try:
        access_token = cache.get('access_token')

        # 로그인 요청을 보내서 토큰을 받음
        if access_token is None:
            login_response = requests.post(
                login_url, json=login_payload, headers=headers)

            login_response.raise_for_status()  # HTTP 에러가 발생하면 예외를 일으킵니다.

            login_data = login_response.json()

            access_token = login_data.get('access')
            logger.info("access_token 없음, 새로운 토큰 요청 시도")

            if not access_token:
                logger.error("access_token 가져올 수 없음")
                return JsonResponse({'error': 'Access token not found in login response'}, status=500)
            
            # 토큰을 캐시에 저장하고 만료 시간을 24시간으로 설정
            try: 
                cache.set('access_token', access_token, timeout=86400)  # 24시간 = 86400초
                logger.info(f"새로운 access_token 캐싱: {access_token}")
            except Exception as e:
                logger.error(f"캐시에 access_token 저장 중 오류 발생: {str(e)}")
        else:
            logger.info(f"캐시에서 access_token 가져옴: {access_token}")

        # 토큰을 사용하여 실제 데이터를 가져옴
        info_headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {access_token}"
        }
        info_response = requests.get(info_url, headers=info_headers)
        info_response.raise_for_status()

        info_data = info_response.json()
        if info_data['result'] != 'success':
            return JsonResponse({'error': 'Failed to fetch job info'}, status=500)

        # 필요한 데이터 추출
        data = info_data['data']
        coordinates = data['lonlat']['coordinates']
        return JsonResponse({'coordinates': coordinates, 'job_info': data})

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        return JsonResponse({'error': 'Request failed', 'details': str(e)}, status=500)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JsonResponse({'error': 'Unexpected error', 'details': str(e)}, status=500)

# 좌표 반환 api 
def get_xml(request, job_id):
    logger.info(f"get_xml api 실행") 
    login_url = "http://api.dromii.com:8080/api/v2/login"
    xml_url = f"http://res.dromii.com:3003/{job_id}/ortho"
    api_key = "YCmLIC7b8HT6xjd5rL2SPvuMdnYwiQEb"
    login_payload = {
        "email": "superuser@dromii.com",
        "password": "1234"
    }
    headers = {
        "Content-Type": "application/json",
        "apikey": api_key
    }

    try:
        access_token = cache.get('access_token')

        # 로그인 요청을 보내서 토큰을 받음
        if access_token is None:
            login_response = requests.post(login_url, json=login_payload, headers=headers)
            login_response.raise_for_status()

            login_data = login_response.json()
            access_token = login_data.get('access')
            logger.info("access_token 없음, 새로운 토큰 요청 시도")

            if not access_token:
                logger.error("access_token 가져올 수 없음")
                return JsonResponse({'error': 'Access token not found in login response'}, status=500)
            
            # 토큰을 캐시에 저장하고 만료 시간을 24시간으로 설정
            try: 
                cache.set('access_token', access_token, timeout=86400)  # 24시간 = 86400초
                logger.info(f"새로운 access_token 캐싱: {access_token}")
            except Exception as e:
                logger.error(f"캐시에 access_token 저장 중 오류 발생: {str(e)}")
        else:
            logger.info(f"캐시에서 access_token 가져옴: {access_token}")

        # 토큰을 사용하여 XML 데이터를 가져옴
        xml_headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {access_token}"
        }
        xml_response = requests.get(xml_url, headers=xml_headers)
        xml_response.raise_for_status()

        # XML 데이터를 반환
        return HttpResponse(xml_response.content, content_type='application/xml')

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        return JsonResponse({'error': 'Request failed', 'details': str(e)}, status=500)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JsonResponse({'error': 'Unexpected error', 'details': str(e)}, status=500)

def get_v2_image(request, job_id, z, x, y):
    logger.info(f"get_tile_image api 실행: z={z}, x={x}, y={y}")
    image_url = f"http://res.dromii.com:3003/jobs/{job_id}/orthophoto/{z}/{x}/{y}.png"
    logger.info(f"Requesting image from URL: {image_url}")

    try:
        image_response = requests.get(image_url)
        image_response.raise_for_status()
        logger.info("Image fetched successfully.")
        return HttpResponse(image_response.content, content_type='image/png')
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        return JsonResponse({'error': 'Request failed', 'details': str(e)}, status=500)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JsonResponse({'error': 'Unexpected error', 'details': str(e)}, status=500)

# def test(request,job_id):

        