import pytest

from house_of_refuge.main.models import SubStatus, Coordinator, HousingResource, Submission, ObjectChange
from house_of_refuge.main.tests.factories import SubmissionFactory, HousingResourceFactory
from house_of_refuge.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_matcher_changing(client):
    user1 = UserFactory()
    user2 = UserFactory()
    sub = SubmissionFactory()
    sub.matcher = user1
    sub.status = SubStatus.SEARCHING
    sub.save()

    # now user 2 wants to clear the matcher
    client.force_login(user2)
    response = client.post(f"/api/sub/update/{sub.id}", data={"fields": {"matcher_id": None, "status": "new"}}, content_type="application/json")
    assert response.status_code == 400
    sub.refresh_from_db()
    assert sub.matcher == user1
    assert sub.status == SubStatus.SEARCHING

    # now user2 is a coordinator -- the change is possible
    Coordinator.objects.create(user=user2, group="remote")
    response = client.post(f"/api/sub/update/{sub.id}", data={"fields": {"matcher_id": None, "status": "new"}},
                           content_type="application/json")
    assert response.status_code == 200
    sub.refresh_from_db()
    assert sub.matcher is None
    assert sub.status == SubStatus.NEW


@pytest.mark.django_db
def test_db_queries_on_sub_getting(client, user, django_assert_num_queries):
    client.force_login(user)
    for _ in range(40):
        SubmissionFactory()
        HousingResourceFactory()
    with django_assert_num_queries(1):
        response = client.get("/api/zgloszenia")
        assert response.status_code == 200


@pytest.mark.django_db
def test_db_queries_on_sub_getting(client, user, django_assert_num_queries):
    client.force_login(user)
    user2 = UserFactory()
    for _ in range(40):
        SubmissionFactory()
        HousingResourceFactory()

    r = HousingResource.objects.first()
    r.owner = user2
    r.save()

    dropped = HousingResource.objects.last()
    dropped.is_dropped = True
    dropped.save()

    sub = Submission.objects.first()

    sub.receiver = user2
    sub.matcher = user
    sub.save()

    with django_assert_num_queries(4):
        response = client.get("/api/zgloszenia")
        assert response.status_code == 200


@pytest.mark.django_db
def test_db_queries_on_sub_getting(client, user, django_assert_num_queries):
    client.force_login(user)
    user2 = UserFactory()
    for _ in range(40):
        SubmissionFactory()
        HousingResourceFactory()

    r = HousingResource.objects.first()
    r.owner = user2
    r.save()


    dropped = HousingResource.objects.last()
    dropped.is_dropped = True
    dropped.save()

    sub = Submission.objects.first()

    sub.receiver = user2
    sub.matcher = user
    sub.resource = r
    sub.save()
    ObjectChange.objects.create(host=r, submission=sub, user=user2, change="test")

    with django_assert_num_queries(4):
        response = client.get("/api/zgloszenia")
        assert len(response.json()['data']['submissions']) == 40
        assert response.status_code == 200

    for _ in range(40):
        SubmissionFactory()
        HousingResourceFactory()

    with django_assert_num_queries(4):
        response = client.get("/api/zgloszenia")
        assert len(response.json()['data']['submissions']) == 80
        assert response.status_code == 200


@pytest.mark.django_db
def test_db_queries_on_resource_getting(client, user, django_assert_num_queries):
    client.force_login(user)
    user2 = UserFactory()
    for _ in range(40):
        SubmissionFactory()
        HousingResourceFactory()

    r = HousingResource.objects.first()
    r.owner = user2
    r.save()

    dropped = HousingResource.objects.last()
    dropped.is_dropped = True
    dropped.save()

    sub = Submission.objects.first()

    sub.receiver = user2
    sub.matcher = user
    sub.save()

    with django_assert_num_queries(3):
        response = client.get("/api/zasoby")
        assert response.status_code == 200


@pytest.mark.django_db
def test_housing_resource_endpoint(client):
    data = dict(
        name="Jan III Sobieski",
        about_info="I have a a fairly big place to share",
        resource="flat",
        city_and_zip_code="Warsaw, 02-958",
        zip_code="02-958",
        address="Stanisława Kostki Potockiego 10/16",
        people_to_accommodate="300",
        age="393",
        languages="polish, german, turkish",
        when_to_call="9-22",
        costs="0",
        availability="2022-03-01",
        accommodation_length="365",
        details="I just wanna help",
        transport="poland",
        phone_number="600 500 500",
        backup_phone_number="601 500 500",
        email="fidei-defensor@onet.pl",
        extra="",
    )

    response = client.post("/api/stworz_zasob", data=data, content_type="application/json")
    assert response.status_code == 201, response.json()

    resource = HousingResource.objects.get()
    data["about_info"] = "I added something new"

    # no token passed
    response = client.put("/api/stworz_zasob", data=data, content_type="application/json")
    assert response.status_code == 400, response.json()

    # now we're passing dubious token
    data['token'] = '123'
    response = client.put("/api/stworz_zasob", data=data, content_type="application/json")
    assert response.status_code == 404, response.json()

    # now we're passing proper token
    data['token'] = resource.token
    response = client.put("/api/stworz_zasob", data=data, content_type="application/json")
    assert response.status_code == 202, response.json()

    resource.refresh_from_db()
    assert resource.about_info == "I added something new"

    response = client.delete("/api/stworz_zasob", data={"token": resource.token}, content_type="application/json")
    assert response.status_code == 204
    assert HousingResource.objects.count() == 0

