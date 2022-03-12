import re
from datetime import timedelta

from django.utils import timezone


def ago(**kwargs):
    return timezone.now() - timedelta(**kwargs)


def get_phone_number_display(phone_str):
    def switch_phone(matchobj):
        phone = matchobj.group(0).strip()
        if len(phone) <= 9:
            return re.sub(r'(\d{3})\s*(\d{3})\s*(\d{3})', '\g<1> \g<2> \g<3>', phone).strip()
        else:
            return re.sub(r'(\+?\d{2,3})?\s*(\d{3})\s*(\d{3})\s*(\d{3})', '\g<1> \g<2> \g<3> \g<4>', phone).strip()
    return re.sub(r'[\d\+\(][\s\d\-\(\)+]+[\d\)]', switch_phone, phone_str)
