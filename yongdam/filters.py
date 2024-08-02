from django_filters import rest_framework as filters
from .models import Yongdamcadastralall , Yongdamcadastraltarget

class YongdamcadastralallFilter(filters.FilterSet): # filters 의 FileterSet 상속 
    # jibun : 필드를 필터링할떄 사용할 단어 # field_name : 필터링할 모델 필드 # method : 커스텀 필더링 메서드 . 밑에 정의  
    jibun = filters.CharFilter(field_name='jibun', method='filter_by_jibun') # 필터 정의 

    class Meta: # 필터셋에 대한 메타데이터 정의 
        model = Yongdamcadastralall # 사용할 모델
        fields = ['jibun'] # 필드 

    def filter_by_jibun(self, queryset, name, value): 
        '''
         이 필터 함수에서 name 은 쓰이지 않았지만 , 
        Django Filter 라이브러리가 커스텀 필터 메서드를 호출할 때 
        이 세 개의 인자를 전달하기 때문에 항상 3개의 인자를 정의해야한다. 
        '''
        jibun_list = value.split(',')
        return queryset.filter(jibun__in=jibun_list)

class YongdamcadastraltargetFilter(filters.FilterSet): # filters 의 FileterSet 상속 
    # jibun : 필드를 필터링할떄 사용할 단어 # field_name : 필터링할 모델 필드 # method : 커스텀 필더링 메서드 . 밑에 정의  
    jibun = filters.CharFilter(field_name='jibun', method='filter_by_jibun') # 필터 정의 

    class Meta: # 필터셋에 대한 메타데이터 정의 
        model = Yongdamcadastraltarget # 사용할 모델
        fields = ['jibun'] # 필드 

    def filter_by_jibun(self, queryset, name, value): 
        '''
         이 필터 함수에서 name 은 쓰이지 않았지만 , 
        Django Filter 라이브러리가 커스텀 필터 메서드를 호출할 때 
        이 세 개의 인자를 전달하기 때문에 항상 3개의 인자를 정의해야한다. 
        '''
        jibun_list = value.split(',')
        return queryset.filter(jibun__in=jibun_list)