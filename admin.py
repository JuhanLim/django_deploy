from django.contrib import admin

@admin.register(Location)
class LocationAdmin(admin.OSMGeoAdmin):
    list_display = ('name','point')

# admin.site.register(UserModel)

# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_display = ['user_id', 'name', 'datetime']
#     list_display_link = ['name']