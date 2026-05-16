from .models import Notification


class NotificationService:
    @classmethod
    def create(cls, recipient, type, title, body, link=''):
        """
        Create and return a Notification for the given recipient.

        Args:
            recipient: User instance
            type: one of Notification.Type values
            title: short summary string
            body: full message text
            link: optional relative URL (e.g. '/approvals/abc')
        """
        return Notification.objects.create(
            recipient=recipient,
            type=type,
            title=title,
            body=body,
            link=link,
        )
