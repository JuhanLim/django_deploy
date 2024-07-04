from rest_framework import serializers
from .models from LargeCategory

# serializers 는 모델 인스턴스를 JSNO 으로 변환하기 위해 사용 , 반대로도 가능해짐 
class LargeCategorySerializer(serializers.ModelSeializer):
    class Meta :
        model = LargeCategory
        fields = ('name','geom') # model 에 id 는 빠져서 동일하게 맞춤. 처리할 필드 선택 