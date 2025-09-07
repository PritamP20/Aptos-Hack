module 0xe8d532de3a122759fdf2ed724e8461584bf2b282a55f500fd6473e814da7d264::student_management {
    use std::signer;
    use std::string;
    use std::error;
    use std::event;
    use std::vector;
    use std::option;

    /// Error codes
    const EStudentAlreadyExists: u64 = 0;
    const EStudentNotFound: u64 = 1;
    const ENotOwner: u64 = 2;

    /// Struct representing a student
    struct Student has store, drop, copy, key {
        id: u64,
        name: string::String,
        age: u8,
        owner: address,
    }

    /// Resource: Holds all students for an account
    struct StudentBook has key {
        next_id: u64,
        students: vector<Student>,
    }

    /// Event: StudentAdded
    #[event]
    struct StudentAddedEvent has drop, store {
        owner: address,
        student_id: u64,
        name: string::String,
    }

    /// Event: StudentUpdated
    #[event]
    struct StudentUpdatedEvent has drop, store {
        owner: address,
        student_id: u64,
        new_name: string::String,
        new_age: u8,
    }

    /// Event: StudentDeleted
    #[event]
    struct StudentDeletedEvent has drop, store {
        owner: address,
        student_id: u64,
    }

    /// Resource: Event handle container
    struct StudentEvents has key {
        added_handle: event::EventHandle<StudentAddedEvent>,
        updated_handle: event::EventHandle<StudentUpdatedEvent>,
        deleted_handle: event::EventHandle<StudentDeletedEvent>,
    }

    /// Initializes the student book and event handles for a new account
    public entry fun init_account(account: &signer) {
        let addr = signer::address_of(account);
        assert!(
            !exists<StudentBook>(addr),
            error::already_exists(EStudentAlreadyExists)
        );
        move_to(account, StudentBook {
            next_id: 1,
            students: vector::empty<Student>(),
        });
        move_to(account, StudentEvents {
            added_handle: event::new_event_handle<StudentAddedEvent>(account),
            updated_handle: event::new_event_handle<StudentUpdatedEvent>(account),
            deleted_handle: event::new_event_handle<StudentDeletedEvent>(account),
        });
    }

    /// Add a new student to the caller's student book.
    public entry fun add_student(account: &signer, name: string::String, age: u8) acquires StudentBook, StudentEvents {
        let addr = signer::address_of(account);
        let book = borrow_global_mut<StudentBook>(addr);
        let student_id = book.next_id;
        book.next_id = student_id + 1;
        let student = Student {
            id: student_id,
            name: name.clone(),
            age,
            owner: addr,
        };
        vector::push_back<Student>(&mut book.students, student);

        let events = borrow_global_mut<StudentEvents>(addr);
        event::emit<StudentAddedEvent>(
            &mut events.added_handle,
            StudentAddedEvent {
                owner: addr,
                student_id,
                name,
            }
        );
    }

    /// Update a student's info (name, age) by id. Only owner can update their students.
    public entry fun update_student(account: &signer, student_id: u64, new_name: string::String, new_age: u8) acquires StudentBook, StudentEvents {
        let addr = signer::address_of(account);
        let book = borrow_global_mut<StudentBook>(addr);
        let (i, found) = find_student_idx(&book.students, student_id);
        assert!(found, error::not_found(EStudentNotFound));
        let student_ref = vector::borrow_mut<Student>(&mut book.students, i);
        assert!(student_ref.owner == addr, error::permission_denied(ENotOwner));
        student_ref.name = new_name.clone();
        student_ref.age = new_age;

        let events = borrow_global_mut<StudentEvents>(addr);
        event::emit<StudentUpdatedEvent>(
            &mut events.updated_handle,
            StudentUpdatedEvent {
                owner: addr,
                student_id,
                new_name,
                new_age,
            }
        );
    }

    /// Remove a student by id. Only owner can remove their students.
    public entry fun remove_student(account: &signer, student_id: u64) acquires StudentBook, StudentEvents {
        let addr = signer::address_of(account);
        let book = borrow_global_mut<StudentBook>(addr);
        let (i, found) = find_student_idx(&book.students, student_id);
        assert!(found, error::not_found(EStudentNotFound));
        let student_ref = vector::borrow<Student>(&book.students, i);
        assert!(student_ref.owner == addr, error::permission_denied(ENotOwner));
        vector::swap_remove<Student>(&mut book.students, i);

        let events = borrow_global_mut<StudentEvents>(addr);
        event::emit<StudentDeletedEvent>(
            &mut events.deleted_handle,
            StudentDeletedEvent {
                owner: addr,
                student_id,
            }
        );
    }

    /// View: Get all students for an account
    #[view]
    public fun get_students(addr: address): vector<Student> acquires StudentBook {
        if (!exists<StudentBook>(addr)) {
            return vector::empty<Student>();
        };
        let book = borrow_global<StudentBook>(addr);
        vector::copy<Student>(&book.students)
    }

    /// View: Get a student by id for an address
    #[view]
    public fun get_student(addr: address, student_id: u64): option::Option<Student> acquires StudentBook {
        if (!exists<StudentBook>(addr)) {
            return option::none<Student>();
        };
        let book = borrow_global<StudentBook>(addr);
        let (i, found) = find_student_idx(&book.students, student_id);
        if (!found) {
            option::none<Student>()
        } else {
            let student = vector::borrow<Student>(&book.students, i);
            option::some<Student>(copy *student)
        }
    }

    /// Helper: Find index of a student by id in a vector. Returns (index, found)
    fun find_student_idx(students: &vector<Student>, id: u64): (u64, bool) {
        let len = vector::length<Student>(students);
        let mut i = 0;
        while (i < len) {
            let student = vector::borrow<Student>(students, i);
            if (student.id == id) {
                return (i, true);
            };
            i = i + 1;
        };
        (0, false)
    }
}