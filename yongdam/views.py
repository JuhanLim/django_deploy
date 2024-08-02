from rest_framework import viewsets
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from .models import Yongdamcadastralall , Yongdamcadastraltarget
from .filters import YongdamcadastralallFilter , YongdamcadastraltargetFilter
from .serializers import YongdamcadastralallSerializer , YongdamcadastraltargetSerializer
import requests
from django.http import JsonResponse

class YongdamcadastralallViewSet(viewsets.ModelViewSet):
    queryset = Yongdamcadastralall.objects.all()
    serializer_class = YongdamcadastralallSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = YongdamcadastralallFilter

    def get_queryset(self): # ViewSet 이 반환할 쿼리셋을 커스터마이징 
        queryset = super().get_queryset()
        jibun = self.request.query_params.get('jibun') # 요청의 쿼리 파라미터에서 jibun 값을 가져옴 
        if jibun:
            jibun_list = jibun.split(',') # 지번값이 존재하면 , 쉼표로 분리해 리스트로 만듬
            queryset = queryset.filter(jibun__in=jibun_list) # jibun 값이 리스트에 포함된 레코드를 필터링 
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

    def get_queryset(self): # ViewSet 이 반환할 쿼리셋을 커스터마이징 
        queryset = super().get_queryset()
        jibun = self.request.query_params.get('jibun') # 요청의 쿼리 파라미터에서 jibun 값을 가져옴 
        if jibun:
            jibun_list = jibun.split(',') # 지번값이 존재하면 , 쉼표로 분리해 리스트로 만듬
            queryset = queryset.filter(jibun__in=jibun_list) # jibun 값이 리스트에 포함된 레코드를 필터링 
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

def api_v2_get_all_jobs(request):
    login_url = "http://api.dromii.com:8080/api/v2/login"
    jobs_url = "http://api.dromii.com:8080/api/v2/jobs"
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
        # 로그인 요청을 보내서 토큰을 받음
        login_response = requests.post(login_url, json=login_payload, headers=headers)
        login_response.raise_for_status()  # HTTP 에러가 발생하면 예외를 일으킵니다.

        login_data = login_response.json()
        access_token = login_data.get('access')

        if not access_token:
            return JsonResponse({'error': 'Access token not found in login response'}, status=500)

        # 토큰을 사용하여 실제 데이터를 가져옴
        jobs_headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {access_token}"
        }
        jobs_response = requests.get(jobs_url, headers=jobs_headers)
        jobs_response.raise_for_status()

        jobs_data = jobs_response.json()
        listjobs = jobs_data.get('listjobs', [])

        # 필요한 데이터만 추출
        filtered_jobs_data = [
            {
                'pcode': job.get('pcode'),
                'title': job.get('title'),
                'jcode': job.get('jcode')
            }
            for job in listjobs
        ]

        return JsonResponse(filtered_jobs_data, safe=False)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)

