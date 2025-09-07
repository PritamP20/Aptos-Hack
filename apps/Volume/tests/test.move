module 0xe8d532de3a122759fdf2ed724e8461584bf2b282a55f500fd6473e814da7d264::student_management_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use std::option;

    use 0xe8d532de3a122759fdf2ed724e8461584bf2b282a55f500fd6473e814da7d264::student_management;

    #[test]
    fun test_init_account() {
        let alice = @0x1;
        let alice_signer = signer::spec_test_signer(alice);

        student_management::init_account(&alice_signer);

        // Should be able to fetch empty student list
        let students = student_management::get_students(alice);
        assert!(vector::is_empty<Student>(students), 1);
    }

    #[test]
    fun test_add_student() {
        let bob = @0x2;
        let bob_signer = signer::spec_test_signer(bob);

        student_management::init_account(&bob_signer);

        let name1 = string::utf8(b"Alice");
        let age1 = 20u8;
        student_management::add_student(&bob_signer, name1, age1);

        let students = student_management::get_students(bob);
        assert!(vector::length<Student>(students) == 1, 2);

        let s = vector::borrow<Student>(&students, 0);
        assert!(s.id == 1, 3);
        assert!(string::eq(&s.name, &string::utf8(b"Alice")), 4);
        assert!(s.age == 20, 5);
        assert!(s.owner == bob, 6);
    }

    #[test]
    fun test_add_multiple_students() {
        let carol = @0x3;
        let carol_signer = signer::spec_test_signer(carol);

        student_management::init_account(&carol_signer);

        student_management::add_student(&carol_signer, string::utf8(b"Bob"), 18u8);
        student_management::add_student(&carol_signer, string::utf8(b"Charlie"), 21u8);

        let students = student_management::get_students(carol);
        assert!(vector::length<Student>(students) == 2, 7);

        let s0 = vector::borrow<Student>(&students, 0);
        assert!(s0.id == 1, 8);

        let s1 = vector::borrow<Student>(&students, 1);
        assert!(s1.id == 2, 9);
    }

    #[test]
    fun test_update_student_success() {
        let dave = @0x4;
        let dave_signer = signer::spec_test_signer(dave);

        student_management::init_account(&dave_signer);

        student_management::add_student(&dave_signer, string::utf8(b"Dave"), 19u8);

        // Update student id 1
        student_management::update_student(&dave_signer, 1, string::utf8(b"David"), 20u8);

        let s_opt = student_management::get_student(dave, 1);
        assert!(option::is_some<Student>(&s_opt), 10);
        let s = option::extract<Student>(s_opt);
        assert!(string::eq(&s.name, &string::utf8(b"David")), 11);
        assert!(s.age == 20, 12);
    }

    #[test]
    fun test_update_student_not_found_should_abort() {
        let eve = @0x5;
        let eve_signer = signer::spec_test_signer(eve);

        student_management::init_account(&eve_signer);

        let res = move {
            student_management::update_student(&eve_signer, 99, string::utf8(b"NotExists"), 22u8);
            false
        } catch {
            true
        };
        assert!(res, 13);
    }

    #[test]
    fun test_update_student_not_owner_should_abort() {
        let owner = @0x6;
        let not_owner = @0x7;
        let owner_signer = signer::spec_test_signer(owner);
        let not_owner_signer = signer::spec_test_signer(not_owner);

        student_management::init_account(&owner_signer);
        student_management::add_student(&owner_signer, string::utf8(b"OwnerStudent"), 30u8);

        // Second account tries to update owner's student
        let res = move {
            student_management::update_student(&not_owner_signer, 1, string::utf8(b"Imposter"), 99u8);
            false
        } catch {
            true
        };
        assert!(res, 14);
    }

    #[test]
    fun test_remove_student_success() {
        let frank = @0x8;
        let frank_signer = signer::spec_test_signer(frank);

        student_management::init_account(&frank_signer);

        student_management::add_student(&frank_signer, string::utf8(b"Frank"), 21u8);

        student_management::remove_student(&frank_signer, 1);

        let students = student_management::get_students(frank);
        assert!(vector::is_empty<Student>(students), 15);

        let s_opt = student_management::get_student(frank, 1);
        assert!(option::is_none<Student>(&s_opt), 16);
    }

    #[test]
    fun test_remove_student_not_found_should_abort() {
        let grace = @0x9;
        let grace_signer = signer::spec_test_signer(grace);

        student_management::init_account(&grace_signer);

        let res = move {
            student_management::remove_student(&grace_signer, 123);
            false
        } catch {
            true
        };
        assert!(res, 17);
    }

    #[test]
    fun test_remove_student_not_owner_should_abort() {
        let owner = @0xa;
        let not_owner = @0xb;
        let owner_signer = signer::spec_test_signer(owner);
        let not_owner_signer = signer::spec_test_signer(not_owner);

        student_management::init_account(&owner_signer);
        student_management::add_student(&owner_signer, string::utf8(b"OwnerStudent"), 23u8);

        let res = move {
            student_management::remove_student(&not_owner_signer, 1);
            false
        } catch {
            true
        };
        assert!(res, 18);
    }

    #[test]
    fun test_get_students_empty_before_init() {
        let h = @0xc;
        // No init_account called
        let students = student_management::get_students(h);
        assert!(vector::is_empty<Student>(students), 19);
    }

    #[test]
    fun test_get_student_empty_before_init() {
        let i = @0xd;
        let s_opt = student_management::get_student(i, 1);
        assert!(option::is_none<Student>(&s_opt), 20);
    }

    #[test]
    fun test_get_student_non_existent_id() {
        let j = @0xe;
        let j_signer = signer::spec_test_signer(j);
        student_management::init_account(&j_signer);
        student_management::add_student(&j_signer, string::utf8(b"Jenny"), 22u8);

        let s_opt = student_management::get_student(j, 999);
        assert!(option::is_none<Student>(&s_opt), 21);
    }

    #[test]
    fun test_id_auto_increment_after_deletion() {
        let k = @0xf;
        let k_signer = signer::spec_test_signer(k);

        student_management::init_account(&k_signer);

        student_management::add_student(&k_signer, string::utf8(b"Karl"), 25u8);
        student_management::add_student(&k_signer, string::utf8(b"Karl2"), 26u8);

        student_management::remove_student(&k_signer, 1);

        student_management::add_student(&k_signer, string::utf8(b"Karl3"), 27u8);

        let students = student_management::get_students(k);
        assert!(vector::length<Student>(students) == 2, 22);

        let s0 = vector::borrow<Student>(&students, 0);
        let s1 = vector::borrow<Student>(&students, 1);

        assert!(s0.id == 2 || s1.id == 2, 23);
        assert!(s0.id == 3 || s1.id == 3, 24);
    }

    #[test]
    fun test_event_handles_exist() {
        let l = @0x10;
        let l_signer = signer::spec_test_signer(l);

        student_management::init_account(&l_signer);

        // This test simply checks init_account does not abort and the account is ready for events
        student_management::add_student(&l_signer, string::utf8(b"Leo"), 19u8);
        student_management::update_student(&l_signer, 1, string::utf8(b"Leon"), 20u8);
        student_management::remove_student(&l_signer, 1);
    }
}