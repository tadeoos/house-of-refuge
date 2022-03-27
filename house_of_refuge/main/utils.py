import re
from datetime import timedelta

from django.core.mail import get_connection, EmailMultiAlternatives
from django.template.loader import get_template
from django.utils import timezone


def ago(**kwargs):
    return timezone.now() - timedelta(**kwargs)


def extract_number_from_string(str, default=0):
    return max([int(i) for i in re.findall(r"\d+", str)] or [default])


def get_phone_number_display(phone_str):
    def switch_phone(matchobj):
        phone = matchobj.group(0).strip()
        if len(phone) <= 9:
            return re.sub(r'(\d{3})\s*(\d{3})\s*(\d{3})', '\g<1> \g<2> \g<3>', phone).strip()
        else:
            return re.sub(r'(\+?\d{2,3})?\s*(\d{3})\s*(\d{3})\s*(\d{3})', '\g<1> \g<2> \g<3> \g<4>', phone).strip()
    return re.sub(r'[\d\+\(][\s\d\-\(\)+]+[\d\)]', switch_phone, phone_str)


def send_mail(subject, message, from_email, recipient_list,
              fail_silently=False, auth_user=None, auth_password=None,
              connection=None, html_message=None, **kwargs):
    """
    Easy wrapper for sending a single message to a recipient list. All members
    of the recipient list will see the other recipients in the 'To' field.

    If from_email is None, use the DEFAULT_FROM_EMAIL setting.
    If auth_user is None, use the EMAIL_HOST_USER setting.
    If auth_password is None, use the EMAIL_HOST_PASSWORD setting.

    Note: The API for this method is frozen. New code wanting to extend the
    functionality should use the EmailMessage class directly.
    """
    connection = connection or get_connection(
        username=auth_user,
        password=auth_password,
        fail_silently=fail_silently,
    )
    mail = EmailMultiAlternatives(subject, message, from_email, recipient_list, connection=connection, **kwargs)
    if html_message:
        mail.attach_alternative(html_message, 'text/html')

    return mail.send()


def send_goodbye_email(host_email):
    subject = "Przyszłość Grupy Zasoby"
    email_text_content = get_template("emails/goodbye.txt").render()
    send_mail(
        subject=subject,
        message=email_text_content,
        from_email="Grupa Zasoby <powiadomienia@grupazasoby.pl>",
        recipient_list=[host_email],
        reply_to=["grupazasoby@gmail.com"]
    )
