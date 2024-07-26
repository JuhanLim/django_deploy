from minio import Minio 

# minIO 에 접근하기 위한 client 인스턴스 생성  
minio_client = Minio(
    "10.0.0.7:9000",
    access_key="minio",
    secret_key="miniopass",
    secure=False,
)



# raw-data 버킷 생성하기 
if not minio_client.bucket_exists("test") : 
    minio_client.make_bucket("test")

# 버킷 리스트 출력하기 
for bucket in minio_client.list_buckets():
    print(bucket.name)

# # 데이터 삽입  
bucket_name = "test"
object_name = "truecolor.tif"


# minio_client.fput_object(bucket_name,object_name,"truecolor.tif")

objects = minio_client.list_objects(bucket_name, recursive=True)

for obj in objects:
    print(f"Name: {obj.object_name}, Size: {obj.size} bytes")