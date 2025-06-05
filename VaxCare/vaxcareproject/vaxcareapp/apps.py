from django.apps import AppConfig


class VaxcareappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vaxcareapp'

    def ready(self):
        import vaxcareapp.signals
