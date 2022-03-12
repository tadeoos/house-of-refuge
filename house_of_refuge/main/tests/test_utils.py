from house_of_refuge.main.utils import get_phone_number_display


def test_phone_display():
    assert get_phone_number_display("698642122") == "698 642 122"
    assert get_phone_number_display("Marta 698642122") == "Marta 698 642 122"
    assert get_phone_number_display("223212311") == "223 212 311"
    assert get_phone_number_display("608 987 432") == "608 987 432"
    assert get_phone_number_display("0048678562312") == "004 867 856 2312"
    assert get_phone_number_display("+48 123 111 233") == "+48 123 111 233"
    assert get_phone_number_display("+48123111222") == "+48 123 111 222"
    assert get_phone_number_display("380673773583") == "380 673 773 583"
    assert get_phone_number_display("+380977556043") == "+380 977 556 043"
    assert get_phone_number_display("(380)977-5562") == "(380)977-5562"
    assert get_phone_number_display("509321452 / 123564222") == "509 321 452 / 123 564 222"
    assert get_phone_number_display("0991233995") == "099 123 3995"
    assert get_phone_number_display("600 111222, +350111222333, 022333421") == "600 111 222, +350 111 222 333, 022 333 421"
    assert get_phone_number_display("500-111-222") == "500-111-222"
    assert get_phone_number_display("+48797320076 - Basia   +48 606 407 935 - Michał") == "+48 797 320 076 - Basia   +48 606 407 935 - Michał"
